import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SelecaoFotoItemDto {
  @IsString()
  @IsNotEmpty()
  fotoId!: string;

  @IsBoolean()
  selecionada!: boolean;

  @IsOptional()
  @IsString()
  comentario?: string;
}

export class SelecionarFotosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelecaoFotoItemDto)
  selecoes!: SelecaoFotoItemDto[];
}
