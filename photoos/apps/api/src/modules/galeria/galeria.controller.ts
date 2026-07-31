import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { GaleriaService } from './galeria.service';
import { CreateGaleriaDto } from './dto/create-galeria.dto';
import { AddFotoDto } from './dto/add-foto.dto';
import { SelecionarFotosDto } from './dto/selecionar-fotos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Controller('galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  // --- Authenticated Studio Endpoints ---
  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  async findAll(@CurrentTenant() tenantId: string) {
    return this.galeriaService.findAll(tenantId);
  }

  @Get('ensaio/:ensaioId')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  async getByEnsaio(
    @CurrentTenant() tenantId: string,
    @Param('ensaioId') ensaioId: string,
  ) {
    return this.galeriaService.getByEnsaio(tenantId, ensaioId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO, PapelUsuario.FOTOGRAFO)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateGaleriaDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.galeriaService.create(tenantId, dto, usuarioId);
  }

  @Post(':galeriaId/foto')
  @Post(':galeriaId/fotos')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO, PapelUsuario.FOTOGRAFO)
  @HttpCode(HttpStatus.CREATED)
  async addFoto(
    @CurrentTenant() tenantId: string,
    @Param('galeriaId') galeriaId: string,
    @Body() dto: AddFotoDto,
  ) {
    return this.galeriaService.addFoto(tenantId, galeriaId, dto);
  }

  // --- Public Magic Link Portal Endpoints ---
  @Get('publico/:token')
  @Get('portal/:token')
  async getPortalGaleria(@Param('token') token: string) {
    return this.galeriaService.getByLinkPublico(token);
  }

  @Post('publico/:token/selecionar')
  @Post('portal/:token/selecionar')
  @HttpCode(HttpStatus.OK)
  async selecionarFotos(
    @Param('token') token: string,
    @Body() dto: SelecionarFotosDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || '127.0.0.1';
    return this.galeriaService.processarSelecaoCliente(token, dto, ip);
  }
}
