import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PapelUsuario } from '@photoos/types';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class AgendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientesService: ClientesService,
  ) {}

  async getEventos(
    tenantId: string,
    user: { id: string; papel: PapelUsuario },
    start?: string,
    end?: string,
  ) {
    const db = this.prisma.getTenantClient(tenantId);

    const where: any = {};
    if (user.papel === PapelUsuario.FOTOGRAFO) {
      where.fotografos = {
        some: {
          usuarioId: user.id,
        },
      };
    }

    if (start || end) {
      where.dataHora = {};
      if (start) where.dataHora.gte = new Date(start);
      if (end) where.dataHora.lte = new Date(end);
    }

    const ensaios = await db.ensaio.findMany({
      where,
      orderBy: { dataHora: 'asc' },
      include: {
        cliente: {
          select: { id: true, nomeCompleto: true, telefone: true, whatsapp: true },
        },
        servico: {
          select: { id: true, nome: true, tempoMedioMin: true },
        },
        fotografos: {
          include: {
            usuario: {
              select: { id: true, nome: true },
            },
          },
        },
      },
    });

    const whereTarefas: any = {};
    if (start || end) {
      whereTarefas.dataExecucao = {};
      if (start) whereTarefas.dataExecucao.gte = new Date(start);
      if (end) whereTarefas.dataExecucao.lte = new Date(end);
    }

    const tarefas = await db.tarefaWorkflow.findMany({
      where: whereTarefas,
      include: {
        ensaio: {
          select: { id: true, cliente: { select: { nomeCompleto: true } } },
        },
      },
      orderBy: { dataExecucao: 'asc' },
    });

    return {
      ensaios: ensaios.map((e) => ({
        id: e.id,
        title: `${e.servico?.nome} - ${e.cliente?.nomeCompleto}`,
        start: e.dataHora,
        end: e.servico?.tempoMedioMin
          ? new Date(new Date(e.dataHora).getTime() + e.servico.tempoMedioMin * 60000)
          : new Date(new Date(e.dataHora).getTime() + 120 * 60000), // Default 2h
        status: e.status,
        local: e.local,
        cliente: e.cliente,
        servico: e.servico,
        fotografos: e.fotografos,
      })),
      tarefas: tarefas.map((t) => ({
        id: t.id,
        title: `[Tarefa] ${t.titulo}`,
        start: t.dataExecucao,
        end: new Date(new Date(t.dataExecucao).getTime() + 30 * 60000), // 30min default
        concluida: t.concluida,
        ensaioId: t.ensaioId,
        clienteNome: t.ensaio?.cliente?.nomeCompleto,
      })),
    };
  }

  async reagendarEnsaio(
    tenantId: string,
    ensaioId: string,
    novaDataHora: string,
    usuarioId?: string,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    const ensaio = await db.ensaio.findUnique({
      where: { id: ensaioId },
      include: { cliente: true, servico: true },
    });

    if (!ensaio) {
      throw new NotFoundException('Ensaio não encontrado.');
    }

    const anterior = ensaio.dataHora;
    const novaData = new Date(novaDataHora);

    const atualizado = await db.ensaio.update({
      where: { id: ensaioId },
      data: {
        dataHora: novaData,
      },
      include: {
        cliente: true,
        servico: true,
      },
    });

    // Automatically shift workflow tasks based on new schedule
    const diffMs = novaData.getTime() - new Date(anterior).getTime();
    const tarefas = await db.tarefaWorkflow.findMany({
      where: { ensaioId },
    });

    for (const t of tarefas) {
      const novaDataExec = new Date(new Date(t.dataExecucao).getTime() + diffMs);
      await db.tarefaWorkflow.update({
        where: { id: t.id },
        data: {
          dataExecucao: novaDataExec,
        },
      });
    }

    await this.clientesService.addInteraction(
      tenantId,
      ensaio.clienteId,
      'ensaio_reagendado',
      `Ensaio "${ensaio.servico?.nome}" reagendado de ${new Date(anterior).toLocaleString('pt-BR')} para ${novaData.toLocaleString('pt-BR')}`,
      { ensaioId, dataAnterior: anterior, novaData, usuarioId },
    );

    return atualizado;
  }
}
