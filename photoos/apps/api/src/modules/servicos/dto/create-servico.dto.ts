import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome do serviço é obrigatório' })
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNumber()
  @Min(0, { message: 'Valor padrão não pode ser negativo' })
  valorPadrao!: number;

  @IsOptional()
  @IsNumber()
  tempoMedioMin?: number;

  @IsOptional()
  @IsNumber()
  qtdFotosInclusas?: number;

  @IsOptional()
  @IsNumber()
  valorFotoExtra?: number;

  @IsOptional()
  @IsNumber()
  qtdPessoas?: number;

  @IsOptional()
  @IsString()
  local?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
