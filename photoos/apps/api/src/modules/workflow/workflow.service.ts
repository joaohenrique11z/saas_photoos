import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private readonly prisma: PrismaService) {}

  async criarTarefaManual(
    tenantId: string,
    ensaioId: string,
    titulo: string,
    dataExecucao: string,
  ) {
    const db = this.prisma.getTenantClient(tenantId);
    return db.tarefaWorkflow.create({
      data: {
        tenantId,
        ensaioId,
        titulo,
        dataExecucao: new Date(dataExecucao),
        concluida: false,
      },
    });
  }

  async processarLembretes24h() {
    this.logger.log('Iniciando verificação do Cron de Lembretes 24h antes dos ensaios...');
    const agora = new Date();
    const proxima24hInicio = new Date(agora.getTime() + 23 * 60 * 60 * 1000);
    const proxima24hFim = new Date(agora.getTime() + 25 * 60 * 60 * 1000);

    const ensaiosProximos = await this.prisma.ensaio.findMany({
      where: {
        dataHora: {
          gte: proxima24hInicio,
          lte: proxima24hFim,
        },
      },
      include: {
        cliente: true,
        servico: true,
        tenant: true,
      },
    });

    for (const ensaio of ensaiosProximos) {
      const db = this.prisma.getTenantClient(ensaio.tenantId);

      // Check if reminder was already logged
      const jalogado = await db.interacaoTimeline.findFirst({
        where: {
          clienteId: ensaio.clienteId,
          tipo: 'lembrete_24h_enviado',
        },
      });

      if (!jalogado) {
        this.logger.log(
          `[AUTOMACAO COMPLETA - CRON 24h] Disparando lembrete 24h para o cliente "${
            ensaio.cliente?.nomeCompleto
          }" (WhatsApp/Email: ${
            ensaio.cliente?.whatsapp || ensaio.cliente?.email || 'N/A'
          }) sobre o ensaio "${ensaio.servico?.nome}" em ${new Date(
            ensaio.dataHora,
          ).toLocaleString('pt-BR')}`,
        );

        await db.interacaoTimeline.create({
          data: {
            tenantId: ensaio.tenantId,
            clienteId: ensaio.clienteId,
            tipo: 'lembrete_24h_enviado',
            descricao: `Lembrete automático de 24 horas disparado via sistema para o ensaio "${ensaio.servico?.nome}"`,
            metadata: {
              ensaioId: ensaio.id,
              dataHora: ensaio.dataHora,
            },
          },
        });
      }
    }

    return { verificados: ensaiosProximos.length };
  }
}
