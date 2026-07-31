import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateContratoModeloDto } from './dto/create-contrato-modelo.dto';
import { UpdateContratoModeloDto } from './dto/update-contrato-modelo.dto';

@Injectable()
export class ContratosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllModelos(tenantId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contratoModelo.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findModeloById(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contratoModelo.findUnique({
      where: { id },
    });
  }

  async createModelo(tenantId: string, dto: CreateContratoModeloDto) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contratoModelo.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async updateModelo(
    tenantId: string,
    id: string,
    dto: UpdateContratoModeloDto,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contratoModelo.update({
      where: { id },
      data: dto,
    });
  }

  async deleteModelo(tenantId: string, id: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contratoModelo.delete({
      where: { id },
    });
  }

  async findContratoByEnsaio(tenantId: string, ensaioId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contrato.findUnique({
      where: { ensaioId },
      include: {
        ensaio: {
          include: {
            cliente: true,
            servico: true,
          },
        },
      },
    });
  }

  async upsertContrato(
    tenantId: string,
    ensaioId: string,
    conteudoFinal: string,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contrato.upsert({
      where: { ensaioId },
      create: {
        ensaioId,
        conteudoFinal,
        assinado: false,
        tenantId,
      },
      update: {
        conteudoFinal,
      },
    });
  }

  async assinarContrato(
    tenantId: string,
    ensaioId: string,
    ipAssinatura: string,
    hashDocumento: string,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.contrato.update({
      where: { ensaioId },
      data: {
        assinado: true,
        assinadoEm: new Date(),
        ipAssinatura,
        hashDocumento,
      },
    });
  }
}
