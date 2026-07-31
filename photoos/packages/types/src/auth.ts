import { PapelUsuario } from './enums';

export interface IJwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  papel: PapelUsuario;
  iat?: number;
  exp?: number;
}

export interface ILoginResponse {
  accessToken: string;
  usuario: {
    id: string;
    email: string;
    nome: string;
    papel: PapelUsuario;
    tenantId: string;
  };
}
