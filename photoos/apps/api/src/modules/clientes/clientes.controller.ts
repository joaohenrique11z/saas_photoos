import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Controller('clientes')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.clientesService.findAll(tenantId, search);
  }

  @Get(':id')
  async findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.clientesService.findById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateClienteDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.clientesService.create(tenantId, dto, usuarioId);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.clientesService.update(tenantId, id, dto, usuarioId);
  }

  @Delete(':id')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.clientesService.delete(tenantId, id);
  }

  @Get(':id/timeline')
  async getTimeline(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.clientesService.getTimeline(tenantId, id);
  }

  @Post(':id/timeline')
  @HttpCode(HttpStatus.CREATED)
  async addInteraction(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { tipo: string; descricao: string; metadata?: Record<string, any> },
  ) {
    return this.clientesService.addInteraction(
      tenantId,
      id,
      body.tipo,
      body.descricao,
      body.metadata,
    );
  }
}
