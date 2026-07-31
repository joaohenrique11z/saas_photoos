import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusEnsaio } from '@photoos/types';

export class CreateEnsaioDto {
  @IsString()
  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  clienteId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Serviço é obrigatório' })
  servicoId!: string;

  @IsDateString({}, { message: 'Data e hora inválidas' })
  dataHora!: string;

  @IsOptional()
  @IsString()
  local?: string;

  @IsNumber()
  @Min(0, { message: 'Valor total não pode ser negativo' })
  valorTotal!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sinalPago?: number;

  @IsOptional()
  @IsEnum(StatusEnsaio)
  status?: StatusEnsaio;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotografoIds?: string[];
}
