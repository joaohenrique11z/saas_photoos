import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { TipoTransacao, StatusTransacao, StatusEnsaio } from '@photoos/types';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardResumo(tenantId: string) {
    const db = this.prisma.getTenantClient(tenantId);

    const now = new Date();
    const primeiroDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totalClientes = await db.cliente.count();

    const ensaiosMes = await db.ensaio.count({
      where: {
        dataHora: {
          gte: primeiroDiaMes,
          lte: ultimoDiaMes,
        },
      },
    });

    const transacoesMes = await db.transacaoFinanceira.findMany({
      where: {
        dataVencimento: {
          gte: primeiroDiaMes,
          lte: ultimoDiaMes,
        },
      },
    });

    let receitaMes = 0;
    let despesaMes = 0;
    let receitaPendente = 0;

    for (const tx of transacoesMes) {
      const val = Number(tx.valor || 0);
      if (tx.tipo === TipoTransacao.RECEITA) {
        if (tx.status === StatusTransacao.PAGO) {
          receitaMes += val;
        } else if (tx.status === StatusTransacao.PENDENTE) {
          receitaPendente += val;
        }
      } else if (tx.tipo === TipoTransacao.DESPESA) {
        despesaMes += val;
      }
    }

    // Grafico 1: Receita e Lucro dos Ultimos 6 meses
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const graficoReceitaPorMes: Array<{ mes: string; receita: number; despesa: number; lucro: number }> = [];
    const graficoClientesPorMes: Array<{ mes: string; novosClientes: number }> = [];

    for (let idx = 5; idx >= 0; idx--) {
      const d = new Date(now.getFullYear(), now.getMonth() - idx, 1);
      const startMes = new Date(d.getFullYear(), d.getMonth(), 1);
      const endMes = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const label = `${mesesNomes[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;

      const txsMes = await db.transacaoFinanceira.findMany({
        where: {
          dataVencimento: {
            gte: startMes,
            lte: endMes,
          },
          status: StatusTransacao.PAGO,
        },
      });

      let rec = 0;
      let desp = 0;
      for (const t of txsMes) {
        if (t.tipo === TipoTransacao.RECEITA) rec += Number(t.valor || 0);
        if (t.tipo === TipoTransacao.DESPESA) desp += Number(t.valor || 0);
      }

      graficoReceitaPorMes.push({
        mes: label,
        receita: Number(rec.toFixed(2)),
        despesa: Number(desp.toFixed(2)),
        lucro: Number((rec - desp).toFixed(2)),
      });

      const countCl = await db.cliente.count({
        where: {
          criadoEm: {
            gte: startMes,
            lte: endMes,
          },
        },
      });

      graficoClientesPorMes.push({
        mes: label,
        novosClientes: countCl,
      });
    }

    // Grafico 2: Ensaios por Status
    const statusCounts = await db.ensaio.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const graficoEnsaiosPorStatus = statusCounts.map((item) => ({
      status: item.status,
      quantidade: item._count.id,
    }));

    // Proximos Ensaios (agendados ou em andamento a partir de agora)
    const proximosEnsaios = await db.ensaio.findMany({
      where: {
        dataHora: { gte: now },
      },
      orderBy: { dataHora: 'asc' },
      take: 5,
      include: {
        cliente: { select: { id: true, nomeCompleto: true, telefone: true } },
        servico: { select: { id: true, nome: true } },
      },
    });

    return {
      kpis: {
        totalClientes,
        ensaiosMes,
        receitaMes: Number(receitaMes.toFixed(2)),
        despesaMes: Number(despesaMes.toFixed(2)),
        lucroMes: Number((receitaMes - despesaMes).toFixed(2)),
        receitaPendente: Number(receitaPendente.toFixed(2)),
      },
      graficoReceitaPorMes,
      graficoEnsaiosPorStatus,
      graficoClientesPorMes,
      proximosEnsaios,
    };
  }
}
