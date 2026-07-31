import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PapelUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.papel) {
      throw new ForbiddenException('Acesso negado: perfil sem papel atribuído');
    }

    const hasRole = requiredRoles.includes(user.papel);
    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado para o papel ${user.papel}. Requer: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
