import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { IJwtPayload } from '@photoos/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'photoos_jwt_secret_key_change_in_prod',
    });
  }

  async validate(payload: IJwtPayload) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Usuário inválido ou desativado');
    }

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      papel: user.papel,
      tenantId: user.tenantId,
      tenant: user.tenant,
    };
  }
}
