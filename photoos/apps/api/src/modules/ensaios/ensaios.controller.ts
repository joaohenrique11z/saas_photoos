import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnsaiosService } from './ensaios.service';
import { CreateEnsaioDto } from './dto/create-ensaio.dto';
import { UpdateEnsaioDto } from './dto/update-ensaio.dto';
import { UpdateStatusEnsaioDto } from './dto/update-status-ensaio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StatusEnsaio, PapelUsuario } from '@photoos/types';

@Controller('ensaios')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class EnsaiosController {
  constructor(private readonly ensaiosService: EnsaiosService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Query('status') status?: StatusEnsaio,
    @Query('clienteId') clienteId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.ensaiosService.findAll(tenantId, user, {
      status,
      clienteId,
      dataInicio,
      dataFim,
    });
  }

  @Get(':id')
  async findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ensaiosService.findById(tenantId, id, user);
  }

  @Post()
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateEnsaioDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.ensaiosService.create(tenantId, dto, usuarioId);
  }

  @Put(':id')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEnsaioDto,
    @CurrentUser() user: any,
  ) {
    return this.ensaiosService.update(tenantId, id, dto, user);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStatusEnsaioDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.ensaiosService.updateStatus(
      tenantId,
      id,
      dto.status,
      usuarioId,
    );
  }

  @Delete(':id')
  @Roles(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.ensaiosService.delete(tenantId, id);
  }

  @Patch('tarefas/:id/toggle')
  async toggleTarefa(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('concluida') concluida: boolean,
  ) {
    return this.ensaiosService.toggleTarefaWorkflow(
      tenantId,
      id,
      concluida,
    );
  }
}
