import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.servico.findMany({
      where: search
        ? {
            nome: { contains: search, mode: 'insensitive' },
          }
        : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.servico.findUnique({
      where: { id },
    });
  }

  async create(tenantId: string, dto: CreateServicoDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.servico.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateServicoDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.servico.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.servico.delete({
      where: { id },
    });
  }
}
