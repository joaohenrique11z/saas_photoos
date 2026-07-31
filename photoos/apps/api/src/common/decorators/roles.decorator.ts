import { SetMetadata } from '@nestjs/common';
import { PapelUsuario } from '@photoos/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PapelUsuario[]) => SetMetadata(ROLES_KEY, roles);
