import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('dashboard/resumo')
  @Get('resumo')
  async getDashboardResumo(@CurrentTenant() tenantId: string) {
    return this.relatoriosService.getDashboardResumo(tenantId);
  }
}

