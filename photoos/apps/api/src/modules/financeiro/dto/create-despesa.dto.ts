import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateDespesaEnsaioDto {
  @IsString()
  @IsNotEmpty({ message: 'Ensaio ID é obrigatório' })
  ensaioId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao!: string;

  @IsString()
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  categoria!: string; // decoracao, transporte, assistente, aluguel_equipamento...

  @IsNumber()
  @Min(0, { message: 'Valor não pode ser negativo' })
  valor!: number;
}
