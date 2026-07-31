import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { EnsaiosModule } from './modules/ensaios/ensaios.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';
import { ContratosModule } from './modules/contratos/contratos.module';
import { GaleriaModule } from './modules/galeria/galeria.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClientesModule,
    ServicosModule,
    EnsaiosModule,
    AgendaModule,
    FinanceiroModule,
    RelatoriosModule,
    ContratosModule,
    GaleriaModule,
    WorkflowModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
