import { Module } from '@nestjs/common';
import { GaleriaController } from './galeria.controller';
import { GaleriaService } from './galeria.service';
import { GaleriaRepository } from './galeria.repository';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ClientesModule } from '../clientes/clientes.module';
import { EnsaiosModule } from '../ensaios/ensaios.module';

@Module({
  imports: [FinanceiroModule, ClientesModule, EnsaiosModule],
  controllers: [GaleriaController],
  providers: [GaleriaService, GaleriaRepository],
  exports: [GaleriaService, GaleriaRepository],
})
export class GaleriaModule {}
