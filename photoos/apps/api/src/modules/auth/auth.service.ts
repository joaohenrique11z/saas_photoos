import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { PapelUsuario, IJwtPayload } from '@photoos/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerTenant(dto: RegisterTenantDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existingTenant) {
      throw new ConflictException('O slug informado já está em uso por outro estúdio.');
    }

    const senhaHash = await bcrypt.hash(dto.adminSenha, 10);

    const { tenant, adminUser } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          nome: dto.nomeEstudio,
          slug: dto.slug.toLowerCase(),
          plano: 'trial',
        },
      });

      const adminUser = await tx.usuario.create({
        data: {
          tenantId: tenant.id,
          nome: dto.adminNome,
          email: dto.adminEmail.toLowerCase(),
          senhaHash,
          papel: PapelUsuario.ADMIN,
          ativo: true,
        },
      });

      // Default ContratoModelo
      await tx.contratoModelo.create({
        data: {
          tenantId: tenant.id,
          nome: 'Contrato Padrão de Prestação de Serviços Fotográficos',
          conteudoHtml: `
            <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</h1>
            <p><strong>CONTRATANTE:</strong> {{cliente_nome}} - CPF: {{cliente_cpf}}</p>
            <p><strong>CONTRATADO:</strong> ${dto.nomeEstudio}</p>
            <p><strong>SERVIÇO:</strong> {{servico_nome}} - <strong>DATA:</strong> {{data_ensaio}} - <strong>LOCAL:</strong> {{local_ensaio}}</p>
            <p><strong>VALOR TOTAL:</strong> R$ {{valor_total}}</p>
            <h2>CLÁUSULAS GERAIS</h2>
            <p>1. DO OBJETO: O presente contrato tem por objeto a prestação de serviços fotográficos pelo CONTRATADO ao CONTRATANTE conforme especificado no orçamento aprovado.</p>
            <p>2. DO PAGAMENTO: O CONTRATANTE pagará o valor estipulado via meios oficiais disponibilizados pelo estúdio.</p>
            <p>3. DA ENTREGA: As fotografias serão entregues por galeria digital para seleção no prazo estipulado pelo estúdio.</p>
          `,
          ativo: true,
        },
      });

      // Default TemplateMensagem for WhatsApp
      await tx.templateMensagem.createMany({
        data: [
          {
            tenantId: tenant.id,
            nome: 'Confirmação de Agendamento',
            gatilho: 'confirmacao',
            conteudo: 'Olá {{nome_cliente}}! Seu ensaio "{{nome_servico}}" está confirmado para {{data_ensaio}} em {{local_ensaio}}. Até breve!',
            ativo: true,
          },
          {
            tenantId: tenant.id,
            nome: 'Lembrete de Ensaio (24h antes)',
            gatilho: 'lembrete',
            conteudo: 'Olá {{nome_cliente}}! Lembrando que nosso ensaio fotográfico acontecerá amanhã, dia {{data_ensaio}}, às {{hora_ensaio}}. Qualquer dúvida estamos à disposição.',
            ativo: true,
          },
          {
            tenantId: tenant.id,
            nome: 'Galeria Pronta para Seleção',
            gatilho: 'pos_ensaio',
            conteudo: 'Olá {{nome_cliente}}! Suas fotos já estão disponíveis em nossa galeria exclusiva. Acesse o link mágico sem senha: {{link_galeria}}',
            ativo: true,
          },
        ],
      });

      return { tenant, adminUser };
    });

    const tokens = await this.generateTokens(adminUser);

    return {
      usuario: {
        id: adminUser.id,
        email: adminUser.email,
        nome: adminUser.nome,
        papel: adminUser.papel,
        tenantId: adminUser.tenantId,
        tenant: {
          id: tenant.id,
          nome: tenant.nome,
          slug: tenant.slug,
          plano: tenant.plano,
        },
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (!tenant) {
      throw new UnauthorizedException('Estúdio não encontrado.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email.toLowerCase(),
        },
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Credenciais inválidas ou usuário desativado.');
    }

    const isSenhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!isSenhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const tokens = await this.generateTokens(usuario);

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel,
        tenantId: usuario.tenantId,
        tenant: {
          id: tenant.id,
          nome: tenant.nome,
          slug: tenant.slug,
          plano: tenant.plano,
        },
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<IJwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'photoos_refresh_secret_key_change_in_prod',
      });

      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        include: { tenant: true },
      });

      if (!user || !user.ativo) {
        throw new UnauthorizedException('Usuário não autorizado');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (err) {
      throw new UnauthorizedException('Token de atualização inválido ou expirado');
    }
  }

  async validateUserById(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        tenant: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const { senhaHash, ...rest } = user;
    return rest;
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    tenantId: string;
    papel: any;
  }) {
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      papel: user.papel as PapelUsuario,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'photoos_jwt_secret_key_change_in_prod',
      expiresIn: '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'photoos_refresh_secret_key_change_in_prod',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
