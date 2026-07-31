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
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Controller('servicos')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.servicosService.findAll(tenantId, search);
  }

  @Get(':id')
  async findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.servicosService.findById(tenantId, id);
  }

  @Post()
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateServicoDto,
  ) {
    return this.servicosService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateServicoDto,
  ) {
    return this.servicosService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.servicosService.delete(tenantId, id);
  }
}
