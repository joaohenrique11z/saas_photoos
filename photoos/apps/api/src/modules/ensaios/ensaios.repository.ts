import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateEnsaioDto } from './dto/create-ensaio.dto';
import { UpdateEnsaioDto } from './dto/update-ensaio.dto';
import { StatusEnsaio, PapelUsuario } from '@photoos/types';

@Injectable()
export class EnsaiosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    user: { id: string; papel: PapelUsuario },
    filters?: {
      status?: StatusEnsaio;
      clienteId?: string;
      dataInicio?: string;
      dataFim?: string;
    },
  ) {
    const db = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    // RBAC: Photographer/Freelancer only sees assigned sessions
    if (user.papel === PapelUsuario.FOTOGRAFO) {
      where.fotografos = {
        some: {
          usuarioId: user.id,
        },
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.clienteId) {
      where.clienteId = filters.clienteId;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataHora = {};
      if (filters.dataInicio) {
        where.dataHora.gte = new Date(filters.dataInicio);
      }
      if (filters.dataFim) {
        where.dataHora.lte = new Date(filters.dataFim);
      }
    }

    return db.ensaio.findMany({
      where,
      orderBy: { dataHora: 'asc' },
      include: {
        cliente: true,
        servico: true,
        fotografos: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tarefasWorkflow: true,
            despesas: true,
            transacoes: true,
          },
        },
      },
    });
  }

  async findById(
    tenantId: string,
    id: string,
    user?: { id: string; papel: PapelUsuario },
  ) {
    const db = this.prisma.getTenantClient(tenantId);

    const where: any = { id };

    if (user && user.papel === PapelUsuario.FOTOGRAFO) {
      where.fotografos = {
        some: {
          usuarioId: user.id,
        },
      };
    }

    return db.ensaio.findUnique({
      where,
      include: {
        cliente: true,
        servico: true,
        fotografos: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        contrato: true,
        galeria: true,
        tarefasWorkflow: {
          orderBy: { dataExecucao: 'asc' },
        },
        despesas: {
          orderBy: { criadoEm: 'desc' },
        },
        transacoes: {
          orderBy: { dataVencimento: 'asc' },
        },
      },
    });
  }

  async create(tenantId: string, dto: CreateEnsaioDto) {
    const db = this.prisma.getTenantClient(tenantId);

    const { fotografoIds, ...rest } = dto;

    return db.ensaio.create({
      data: {
        ...rest,
        tenantId,
        dataHora: new Date(dto.dataHora),
        status: dto.status || StatusEnsaio.ORCAMENTO_ENVIADO,
        fotografos: fotografoIds
          ? {
              create: fotografoIds.map((uid) => ({
                usuarioId: uid,
              })),
            }
          : undefined,
      },
      include: {
        cliente: true,
        servico: true,
        fotografos: true,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEnsaioDto) {
    const db = this.prisma.getTenantClient(tenantId);
    const { fotografoIds, ...rest } = dto;

    if (fotografoIds) {
      await db.ensaioFotografo.deleteMany({
        where: { ensaioId: id },
      });
    }

    return db.ensaio.update({
      where: { id },
      data: {
        ...rest,
        dataHora: dto.dataHora ? new Date(dto.dataHora) : undefined,
        fotografos: fotografoIds
          ? {
              create: fotografoIds.map((uid) => ({
                usuarioId: uid,
              })),
            }
          : undefined,
      },
      include: {
        cliente: true,
        servico: true,
        fotografos: true,
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: StatusEnsaio) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.ensaio.update({
      where: { id },
      data: { status },
      include: {
        cliente: true,
        servico: true,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.ensaio.delete({
      where: { id },
    });
  }
}
