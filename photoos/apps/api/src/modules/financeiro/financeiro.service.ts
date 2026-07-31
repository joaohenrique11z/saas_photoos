import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FinanceiroRepository } from './financeiro.repository';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { CreateDespesaEnsaioDto } from './dto/create-despesa.dto';
import { TipoTransacao, StatusTransacao } from '@photoos/types';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly financeiroRepository: FinanceiroRepository,
    private readonly clientesService: ClientesService,
  ) {}

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
    return this.financeiroRepository.findAllTransacoes(tenantId, filters);
  }

  async findTransacaoById(tenantId: string, id: string) {
    const tx = await this.financeiroRepository.findTransacaoById(tenantId, id);
    if (!tx) {
      throw new NotFoundException('Transação não encontrada');
    }
    return tx;
  }

  async createTransacao(
    tenantId: string,
    dto: CreateTransacaoDto,
    usuarioId?: string,
  ) {
    const tx = await this.financeiroRepository.createTransacao(tenantId, dto);

    if (tx.clienteId) {
      await this.clientesService.addInteraction(
        tenantId,
        tx.clienteId,
        'transacao_criada',
        `Transação do tipo ${tx.tipo} de R$ ${tx.valor} ("${tx.descricao}") registrada`,
        { transacaoId: tx.id, valor: tx.valor, usuarioId },
      );
    }

    return tx;
  }

  async updateTransacao(
    tenantId: string,
    id: string,
    dto: UpdateTransacaoDto,
    usuarioId?: string,
  ) {
    await this.findTransacaoById(tenantId, id);
    const tx = await this.financeiroRepository.updateTransacao(tenantId, id, dto);

    if (tx.clienteId && dto.status === StatusTransacao.PAGO) {
      await this.clientesService.addInteraction(
        tenantId,
        tx.clienteId,
        'pagamento_recebido',
        `Pagamento recebido de R$ ${tx.valor} ("${tx.descricao}")`,
        { transacaoId: tx.id, valor: tx.valor, usuarioId },
      );
    }

    return tx;
  }

  async deleteTransacao(tenantId: string, id: string) {
    await this.findTransacaoById(tenantId, id);
    return this.financeiroRepository.deleteTransacao(tenantId, id);
  }

  async createDespesaEnsaio(tenantId: string, dto: CreateDespesaEnsaioDto) {
    return this.financeiroRepository.createDespesaEnsaio(tenantId, dto);
  }

  async findDespesasByEnsaio(tenantId: string, ensaioId: string) {
    return this.financeiroRepository.findDespesasByEnsaio(tenantId, ensaioId);
  }

  async deleteDespesaEnsaio(tenantId: string, id: string) {
    return this.financeiroRepository.deleteDespesaEnsaio(tenantId, id);
  }

  async calcularLucroLiquidoEnsaio(tenantId: string, ensaioId: string) {
    const ensaio = await this.financeiroRepository.getFinanceiroEnsaio(
      tenantId,
      ensaioId,
    );

    if (!ensaio) {
      throw new NotFoundException('Ensaio não encontrado.');
    }

    const receitaTotal = Number(ensaio.valorTotal || 0);

    const totalDespesas = (ensaio.despesas || []).reduce(
      (acc, d) => acc + Number(d.valor || 0),
      0,
    );

    const transacoesRecebidas = (ensaio.transacoes || [])
      .filter(
        (tx) =>
          tx.tipo === TipoTransacao.RECEITA && tx.status === StatusTransacao.PAGO,
      )
      .reduce((acc, tx) => acc + Number(tx.valor || 0), 0);

    const transacoesPendentes = (ensaio.transacoes || [])
      .filter(
        (tx) =>
          tx.tipo === TipoTransacao.RECEITA &&
          tx.status === StatusTransacao.PENDENTE,
      )
      .reduce((acc, tx) => acc + Number(tx.valor || 0), 0);

    const lucroLiquido = receitaTotal - totalDespesas;
    const margemLucro =
      receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    return {
      ensaioId: ensaio.id,
      clienteNome: ensaio.cliente?.nomeCompleto,
      servicoNome: ensaio.servico?.nome,
      receitaTotal,
      totalDespesas,
      lucroLiquido: Number(lucroLiquido.toFixed(2)),
      margemLucro: Number(margemLucro.toFixed(2)),
      totalRecebido: Number(transacoesRecebidas.toFixed(2)),
      totalPendente: Number(
        Math.max(0, receitaTotal - transacoesRecebidas).toFixed(2),
      ),
      despesasDetalhadas: ensaio.despesas,
      transacoes: ensaio.transacoes,
    };
  }

  async getResumoFinanceiro(tenantId: string, mes?: number, ano?: number) {
    const mesAtual = mes || new Date().getMonth() + 1;
    const anoAtual = ano || new Date().getFullYear();

    const transacoes = await this.financeiroRepository.findAllTransacoes(
      tenantId,
      { mes: mesAtual, ano: anoAtual },
    );

    let receitaTotalMes = 0;
    let despesaTotalMes = 0;
    let valorPendenteRecebimento = 0;

    const proximosVencimentos: any[] = [];

    for (const tx of transacoes) {
      const val = Number(tx.valor || 0);
      if (tx.tipo === TipoTransacao.RECEITA) {
        if (tx.status === StatusTransacao.PAGO) {
          receitaTotalMes += val;
        } else if (tx.status === StatusTransacao.PENDENTE) {
          valorPendenteRecebimento += val;
          proximosVencimentos.push(tx);
        }
      } else if (tx.tipo === TipoTransacao.DESPESA) {
        despesaTotalMes += val;
      }
    }

    const saldoLiquidoMes = receitaTotalMes - despesaTotalMes;

    return {
      mes: mesAtual,
      ano: anoAtual,
      receitaTotalMes: Number(receitaTotalMes.toFixed(2)),
      despesaTotalMes: Number(despesaTotalMes.toFixed(2)),
      saldoLiquidoMes: Number(saldoLiquidoMes.toFixed(2)),
      valorPendenteRecebimento: Number(valorPendenteRecebimento.toFixed(2)),
      proximosVencimentos: proximosVencimentos.slice(0, 10),
    };
  }
}
