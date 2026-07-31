import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.cliente.findMany({
      where: search
        ? {
            OR: [
              { nomeCompleto: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { whatsapp: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: {
          select: { ensaios: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.cliente.findUnique({
      where: { id },
      include: {
        ensaios: {
          include: {
            servico: true,
          },
          orderBy: { dataHora: 'desc' },
        },
        interacoes: {
          orderBy: { criadoEm: 'desc' },
          take: 50,
        },
        transacoes: {
          orderBy: { dataVencimento: 'desc' },
        },
      },
    });
  }

  async create(tenantId: string, dto: CreateClienteDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.cliente.create({
      data: {
        ...dto,
        tenantId,
        dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateClienteDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.cliente.update({
      where: { id },
      data: {
        ...dto,
        dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.cliente.delete({
      where: { id },
    });
  }

  async addTimelineInteraction(
    tenantId: string,
    clienteId: string,
    tipo: string,
    descricao: string,
    metadata?: Record<string, any>,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.interacaoTimeline.create({
      data: {
        tenantId,
        clienteId,
        tipo,
        descricao,
        metadata,
      },
    });
  }

  async getTimeline(tenantId: string, clienteId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.interacaoTimeline.findMany({
      where: { clienteId },
      orderBy: { criadoEm: 'desc' },
    });
  }
}
