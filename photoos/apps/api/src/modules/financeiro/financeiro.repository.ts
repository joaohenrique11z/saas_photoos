import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { CreateDespesaEnsaioDto } from './dto/create-despesa.dto';
import { TipoTransacao, StatusTransacao } from '@photoos/types';

@Injectable()
export class FinanceiroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTransacoes(
    tenantId: string,
    filters?: {
      tipo?: TipoTransacao;
      status?: StatusTransacao;
      ensaioId?: string;
      clienteId?: string;
      mes?: number;
      ano?: number;
    },
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    const where: any = {};

    if (filters?.tipo) where.tipo = filters.tipo;
    if (filters?.status) where.status = filters.status;
    if (filters?.ensaioId) where.ensaioId = filters.ensaioId;
    if (filters?.clienteId) where.clienteId = filters.clienteId;

    if (filters?.mes && filters?.ano) {
      const inicio = new Date(filters.ano, filters.mes - 1, 1);
      const fim = new Date(filters.ano, filters.mes, 0, 23, 59, 59);
      where.dataVencimento = {
        gte: inicio,
        lte: fim,
      };
    }

    return db.transacaoFinanceira.findMany({
      where,
      orderBy: { dataVencimento: 'desc' },
      include: {
        cliente: {
          select: { id: true, nomeCompleto: true },
        },
        ensaio: {
          select: {
            id: true,
            servico: {
              select: { id: true, nome: true },
            },
          },
        },
      },
    });
  }

  async findTransacaoById(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.transacaoFinanceira.findUnique({
      where: { id },
      include: {
        cliente: true,
        ensaio: {
          include: { servico: true },
        },
      },
    });
  }

  async createTransacao(tenantId: string, dto: CreateTransacaoDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.transacaoFinanceira.create({
      data: {
        ...dto,
        tenantId,
        dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : undefined,
      },
    });
  }

  async updateTransacao(
    tenantId: string,
    id: string,
    dto: UpdateTransacaoDto,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.transacaoFinanceira.update({
      where: { id },
      data: {
        ...dto,
        dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
        dataPagamento: dto.dataPagamento ? new Date(dto.dataPagamento) : undefined,
      },
    });
  }

  async deleteTransacao(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.transacaoFinanceira.delete({
      where: { id },
    });
  }

  async createDespesaEnsaio(tenantId: string, dto: CreateDespesaEnsaioDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.despesaEnsaio.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findDespesasByEnsaio(tenantId: string, ensaioId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.despesaEnsaio.findMany({
      where: { ensaioId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async deleteDespesaEnsaio(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.despesaEnsaio.delete({
      where: { id },
    });
  }

  async getFinanceiroEnsaio(tenantId: string, ensaioId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    const ensaio = await db.ensaio.findUnique({
      where: { id: ensaioId },
      include: {
        despesas: true,
        transacoes: true,
        servico: true,
        cliente: true,
      },
    });
    return ensaio;
  }
}
