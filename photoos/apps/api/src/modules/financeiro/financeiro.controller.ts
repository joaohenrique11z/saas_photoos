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
import { FinanceiroService } from './financeiro.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { CreateDespesaEnsaioDto } from './dto/create-despesa.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoTransacao, StatusTransacao, PapelUsuario } from '@photoos/types';

@Controller('financeiro')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get('transacoes')
  async findAllTransacoes(
    @CurrentTenant() tenantId: string,
    @Query('tipo') tipo?: TipoTransacao,
    @Query('status') status?: StatusTransacao,
    @Query('ensaioId') ensaioId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.financeiroService.findAllTransacoes(tenantId, {
      tipo,
      status,
      ensaioId,
      clienteId,
      mes: mes ? Number(mes) : undefined,
      ano: ano ? Number(ano) : undefined,
    });
  }

  @Get('resumo')
  async getResumo(
    @CurrentTenant() tenantId: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.financeiroService.getResumoFinanceiro(
      tenantId,
      mes ? Number(mes) : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  @Get('ensaio/:id/lucro-liquido')
  @Get('ensaio/:id/lucro')
  async getLucroLiquidoEnsaio(
    @CurrentTenant() tenantId: string,
    @Param('id') ensaioId: string,
  ) {
    return this.financeiroService.calcularLucroLiquidoEnsaio(tenantId, ensaioId);
  }

  @Post('transacoes')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async createTransacao(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTransacaoDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.financeiroService.createTransacao(tenantId, dto, usuarioId);
  }

  @Put('transacoes/:id')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  async updateTransacao(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransacaoDto,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.financeiroService.updateTransacao(tenantId, id, dto, usuarioId);
  }

  @Delete('transacoes/:id')
  @Roles(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransacao(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.financeiroService.deleteTransacao(tenantId, id);
  }

  @Post('despesas-ensaio')
  @Roles(PapelUsuario.ADMIN, PapelUsuario.FUNCIONARIO)
  @HttpCode(HttpStatus.CREATED)
  async createDespesaEnsaio(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateDespesaEnsaioDto,
  ) {
    return this.financeiroService.createDespesaEnsaio(tenantId, dto);
  }

  @Get('despesas-ensaio/:ensaioId')
  async getDespesasEnsaio(
    @CurrentTenant() tenantId: string,
    @Param('ensaioId') ensaioId: string,
  ) {
    return this.financeiroService.findDespesasByEnsaio(tenantId, ensaioId);
  }

  @Delete('despesas-ensaio/:id')
  @Roles(PapelUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDespesaEnsaio(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.financeiroService.deleteDespesaEnsaio(tenantId, id);
  }
}
