import { Module } from '@nestjs/common';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroRepository } from './financeiro.repository';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  imports: [ClientesModule],
  controllers: [FinanceiroController],
  providers: [FinanceiroService, FinanceiroRepository],
  exports: [FinanceiroService, FinanceiroRepository],
})
export class FinanceiroModule {}
