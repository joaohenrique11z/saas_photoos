import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateGaleriaDto {
  @IsString()
  @IsNotEmpty({ message: 'Ensaio ID é obrigatório' })
  ensaioId!: string;

  @IsNumber()
  @Min(1, { message: 'Limite de seleção deve ser pelo menos 1' })
  limiteSelecao!: number;
}
