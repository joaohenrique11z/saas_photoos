import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssinarContratoDto {
  @IsString()
  @IsNotEmpty({ message: 'IP do assinante é obrigatório' })
  ipAssinatura!: string;

  @IsOptional()
  @IsString()
  hashDocumento?: string;
}
