import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContratoModeloDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome do modelo é obrigatório' })
  nome!: string;

  @IsString()
  @IsNotEmpty({ message: 'Conteúdo HTML do contrato é obrigatório' })
  conteudoHtml!: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
