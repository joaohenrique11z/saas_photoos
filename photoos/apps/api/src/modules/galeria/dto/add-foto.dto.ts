import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddFotoDto {
  @IsString()
  @IsNotEmpty({ message: 'URL da foto é obrigatória' })
  urlOriginal!: string;

  @IsOptional()
  @IsNumber()
  ordem?: number;
}
