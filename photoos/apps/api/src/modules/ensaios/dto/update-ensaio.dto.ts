import { PartialType } from '@nestjs/swagger';
import { CreateEnsaioDto } from './create-ensaio.dto';

export class UpdateEnsaioDto extends PartialType(CreateEnsaioDto) {}
