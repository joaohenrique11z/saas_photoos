import { Module } from '@nestjs/common';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosRepository } from './contratos.repository';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  imports: [ClientesModule],
  controllers: [ContratosController],
  providers: [ContratosService, ContratosRepository],
  exports: [ContratosService, ContratosRepository],
})
export class ContratosModule {}
