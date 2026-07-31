import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome do estúdio é obrigatório' })
  nomeEstudio!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug é obrigatório' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hifens',
  })
  slug!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome do administrador é obrigatório' })
  adminNome!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email do administrador é obrigatório' })
  adminEmail!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  adminSenha!: string;
}
