import { PartialType } from '@nestjs/swagger';
import { CreateContratoModeloDto } from './create-contrato-modelo.dto';

export class UpdateContratoModeloDto extends PartialType(CreateContratoModeloDto) {}
