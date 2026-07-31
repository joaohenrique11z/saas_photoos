import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TipoTransacao, StatusTransacao } from '@photoos/types';

export class CreateTransacaoDto {
  @IsOptional()
  @IsString()
  ensaioId?: string;

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsEnum(TipoTransacao, { message: 'Tipo deve ser RECEITA ou DESPESA' })
  tipo!: TipoTransacao;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao!: string;

  @IsNumber()
  @Min(0, { message: 'Valor não pode ser negativo' })
  valor!: number;

  @IsOptional()
  @IsString()
  metodoPagamento?: string;

  @IsOptional()
  @IsEnum(StatusTransacao)
  status?: StatusTransacao;

  @IsOptional()
  @IsDateString()
  dataVencimento?: string;

  @IsOptional()
  @IsDateString()
  dataPagamento?: string;
}
