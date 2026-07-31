import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateGaleriaDto } from './dto/create-galeria.dto';

@Injectable()
export class GaleriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.galeria.findMany({
      where: { tenantId },
      include: {
        fotos: {
          orderBy: { ordem: 'asc' },
        },
        ensaio: {
          include: {
            cliente: true,
            servico: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findByEnsaio(tenantId: string, ensaioId: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.galeria.findUnique({
      where: { ensaioId },
      include: {
        fotos: {
          orderBy: { ordem: 'asc' },
        },
        ensaio: {
          include: {
            cliente: true,
            servico: true,
          },
        },
      },
    });
  }

  async findByLinkPublico(linkPublico: string) {
    return this.prisma.galeria.findUnique({
      where: { linkPublico },
      include: {
        fotos: {
          orderBy: { ordem: 'asc' },
        },
        ensaio: {
          include: {
            cliente: true,
            servico: true,
            contrato: true,
            transacoes: true,
          },
        },
      },
    });
  }

  async create(tenantId: string, dto: CreateGaleriaDto, linkPublico: string) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.galeria.create({
      data: {
        tenantId,
        ensaioId: dto.ensaioId,
        limiteSelecao: dto.limiteSelecao,
        linkPublico,
        finalizada: false,
      },
      include: {
        fotos: true,
      },
    });
  }

  async addFoto(
    tenantId: string,
    galeriaId: string,
    urlOriginal: string,
    urlBaixaRes: string,
    ordem: number,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.fotoGaleria.create({
      data: {
        tenantId,
        galeriaId,
        urlOriginal,
        urlBaixaRes,
        ordem,
        selecionada: false,
      },
    });
  }

  async updateFotoSelecao(
    fotoId: string,
    selecionada: boolean,
    comentario?: string,
  ) {
    return this.prisma.fotoGaleria.update({
      where: { id: fotoId },
      data: {
        selecionada,
        comentario: comentario || null,
      },
    });
  }

  async countFotosSelecionadas(galeriaId: string) {
    return this.prisma.fotoGaleria.count({
      where: {
        galeriaId,
        selecionada: true,
      },
    });
  }

  async markFinalizada(galeriaId: string) {
    return this.prisma.galeria.update({
      where: { id: galeriaId },
      data: {
        finalizada: true,
      },
    });
  }
}
