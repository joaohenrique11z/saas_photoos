import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Controller('agenda')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  @Get('eventos')
  async getEventos(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.agendaService.getEventos(tenantId, user, start, end);
  }

  @Patch('ensaio/:id/reagendar')
  @Patch('reagendar/:id')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  async reagendar(
    @CurrentTenant() tenantId: string,
    @Param('id') ensaioId: string,
    @Body('novaDataHora') novaDataHora: string,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.agendaService.reagendarEnsaio(
      tenantId,
      ensaioId,
      novaDataHora,
      usuarioId,
    );
  }
}
