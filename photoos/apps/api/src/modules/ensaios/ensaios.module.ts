import { Module } from '@nestjs/common';
import { EnsaiosController } from './ensaios.controller';
import { EnsaiosService } from './ensaios.service';
import { EnsaiosRepository } from './ensaios.repository';
import { EnsaioStatusService } from './ensaio-status.service';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  imports: [ClientesModule],
  controllers: [EnsaiosController],
  providers: [EnsaiosService, EnsaiosRepository, EnsaioStatusService],
  exports: [EnsaiosService, EnsaiosRepository, EnsaioStatusService],
})
export class EnsaiosModule {}
