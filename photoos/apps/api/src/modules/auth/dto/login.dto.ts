import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ser um endereço válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug do estúdio (tenant) é obrigatório' })
  slug!: string;
}
