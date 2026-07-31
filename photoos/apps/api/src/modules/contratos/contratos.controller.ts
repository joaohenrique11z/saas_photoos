import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ContratosService } from './contratos.service';
import { CreateContratoModeloDto } from './dto/create-contrato-modelo.dto';
import { UpdateContratoModeloDto } from './dto/update-contrato-modelo.dto';
import { GerarContratoDto } from './dto/gerar-contrato.dto';
import { AssinarContratoDto } from './dto/assinar-contrato.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PapelUsuario } from '@photoos/types';

@Controller('contratos')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Get('modelos')
  async findAllModelos(@CurrentTenant() tenantId: string) {
    return this.contratosService.findAllModelos(tenantId);
  }

  @Get('modelos/:id')
  async findModeloById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.contratosService.findModeloById(tenantId, id);
  }

  @Post('modelos')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async createModelo(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateContratoModeloDto,
  ) {
    return this.contratosService.createModelo(tenantId, dto);
  }

  @Put('modelos/:id')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  async updateModelo(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContratoModeloDto,
  ) {
    return this.contratosService.updateModelo(tenantId, id, dto);
  }

  @Delete('modelos/:id')
  @Roles(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModelo(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.contratosService.deleteModelo(tenantId, id);
  }

  @Post('gerar')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async gerarContrato(
    @CurrentTenant() tenantId: string,
    @Body() dto: GerarContratoDto,
  ) {
    return this.contratosService.gerarContrato(
      tenantId,
      dto.ensaioId,
      dto.modeloId,
    );
  }

  @Get('ensaio/:ensaioId')
  async getContratoByEnsaio(
    @CurrentTenant() tenantId: string,
    @Param('ensaioId') ensaioId: string,
  ) {
    return this.contratosService.getContratoByEnsaio(tenantId, ensaioId);
  }

  @Post('assinar/:ensaioId')
  async assinarContrato(
    @CurrentTenant() tenantId: string,
    @Param('ensaioId') ensaioId: string,
    @Body() dto: AssinarContratoDto,
    @Req() req: Request,
    @CurrentUser('sub') usuarioId: string,
  ) {
    const ip = dto.ipAssinatura || req.ip || '127.0.0.1';
    return this.contratosService.assinarContrato(
      tenantId,
      ensaioId,
      { ...dto, ipAssinatura: ip },
      usuarioId,
    );
  }
}
