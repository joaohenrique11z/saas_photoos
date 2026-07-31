import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnsaio } from '@photoos/types';

export class UpdateStatusEnsaioDto {
  @IsEnum(StatusEnsaio, { message: 'Status do ensaio inválido' })
  @IsNotEmpty({ message: 'O novo status é obrigatório' })
  status!: StatusEnsaio;
}
