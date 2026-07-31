import { IsNotEmpty, IsString } from 'class-validator';

export class GerarContratoDto {
  @IsString()
  @IsNotEmpty({ message: 'ID do ensaio é obrigatório' })
  ensaioId!: string;

  @IsString()
  @IsNotEmpty({ message: 'ID do modelo de contrato é obrigatório' })
  modeloId!: string;
}
