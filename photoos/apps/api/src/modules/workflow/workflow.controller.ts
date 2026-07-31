import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('tarefas')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async criarTarefaManual(
    @CurrentTenant() tenantId: string,
    @Body() body: { ensaioId: string; titulo: string; dataExecucao: string },
  ) {
    return this.workflowService.criarTarefaManual(
      tenantId,
      body.ensaioId,
      body.titulo,
      body.dataExecucao,
    );
  }

  @Post('cron/lembretes-24h')
  @HttpCode(HttpStatus.OK)
  async rodarCronLembretes() {
    return this.workflowService.processarLembretes24h();
  }
}
