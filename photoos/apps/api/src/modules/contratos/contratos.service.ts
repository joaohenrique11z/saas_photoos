import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ContratosRepository } from './contratos.repository';
import { CreateContratoModeloDto } from './dto/create-contrato-modelo.dto';
import { UpdateContratoModeloDto } from './dto/update-contrato-modelo.dto';
import { AssinarContratoDto } from './dto/assinar-contrato.dto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class ContratosService {
  constructor(
    private readonly contratosRepository: ContratosRepository,
    private readonly prisma: PrismaService,
    private readonly clientesService: ClientesService,
  ) {}

  async findAllModelos(tenantId: string) {
    return this.contratosRepository.findAllModelos(tenantId);
  }

  async findModeloById(tenantId: string, id: string) {
    const mod = await this.contratosRepository.findModeloById(tenantId, id);
    if (!mod) {
      throw new NotFoundException('Modelo de contrato não encontrado');
    }
    return mod;
  }

  async createModelo(tenantId: string, dto: CreateContratoModeloDto) {
    return this.contratosRepository.createModelo(tenantId, dto);
  }

  async updateModelo(
    tenantId: string,
    id: string,
    dto: UpdateContratoModeloDto,
  ) {
    await this.findModeloById(tenantId, id);
    return this.contratosRepository.updateModelo(tenantId, id, dto);
  }

  async deleteModelo(tenantId: string, id: string) {
    await this.findModeloById(tenantId, id);
    return this.contratosRepository.deleteModelo(tenantId, id);
  }

  async gerarContrato(tenantId: string, ensaioId: string, modeloId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    const ensaio = await db.ensaio.findUnique({
      where: { id: ensaioId },
      include: {
        cliente: true,
        servico: true,
      },
    });

    if (!ensaio) {
      throw new NotFoundException('Ensaio não encontrado');
    }

    const modelo = await this.findModeloById(tenantId, modeloId);

    // Render placeholders
    let conteudoFinal = modelo.conteudoHtml;
    conteudoFinal = conteudoFinal
      .replace(/\{\{cliente_nome\}\}/g, ensaio.cliente?.nomeCompleto || 'N/A')
      .replace(/\{\{cliente_cpf\}\}/g, ensaio.cliente?.cpf || 'Não informado')
      .replace(/\{\{cliente_email\}\}/g, ensaio.cliente?.email || 'N/A')
      .replace(/\{\{cliente_telefone\}\}/g, ensaio.cliente?.telefone || ensaio.cliente?.whatsapp || 'N/A')
      .replace(/\{\{servico_nome\}\}/g, ensaio.servico?.nome || 'N/A')
      .replace(
        /\{\{data_ensaio\}\}/g,
        new Date(ensaio.dataHora).toLocaleDateString('pt-BR'),
      )
      .replace(/\{\{local_ensaio\}\}/g, ensaio.local || 'A definir')
      .replace(/\{\{valor_total\}\}/g, String(ensaio.valorTotal || '0,00'));

    const contrato = await this.contratosRepository.upsertContrato(
      tenantId,
      ensaioId,
      conteudoFinal,
    );

    await this.clientesService.addInteraction(
      tenantId,
      ensaio.clienteId,
      'contrato_gerado',
      `Contrato gerado com base no modelo "${modelo.nome}" para o ensaio "${ensaio.servico?.nome}"`,
      { contratoId: contrato.id, ensaioId },
    );

    return contrato;
  }

  async getContratoByEnsaio(tenantId: string, ensaioId: string) {
    const cont = await this.contratosRepository.findContratoByEnsaio(
      tenantId,
      ensaioId,
    );
    if (!cont) {
      throw new NotFoundException('Nenhum contrato associado a este ensaio');
    }
    return cont;
  }

  async assinarContrato(
    tenantId: string,
    ensaioId: string,
    dto: AssinarContratoDto,
    usuarioId?: string,
  ) {
    const cont = await this.getContratoByEnsaio(tenantId, ensaioId);
    if (cont.assinado) {
      throw new BadRequestException('Este contrato já foi assinado.');
    }

    const hash =
      dto.hashDocumento ||
      crypto
        .createHash('sha256')
        .update(
          `${cont.id}:${cont.conteudoFinal}:${dto.ipAssinatura}:${new Date().toISOString()}`,
        )
        .digest('hex');

    const assinado = await this.contratosRepository.assinarContrato(
      tenantId,
      ensaioId,
      dto.ipAssinatura,
      hash,
    );

    if (cont.ensaio?.clienteId) {
      await this.clientesService.addInteraction(
        tenantId,
        cont.ensaio.clienteId,
        'contrato_assinado',
        `Contrato digital assinado (Hash SHA-256: ${hash.slice(0, 16)}... | IP: ${dto.ipAssinatura})`,
        {
          contratoId: cont.id,
          ip: dto.ipAssinatura,
          hash,
          usuarioId,
        },
      );
    }

    return assinado;
  }
}
