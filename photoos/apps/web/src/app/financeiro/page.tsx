'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { fetchApi } from '../../lib/api';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  // New Transaction modal
  const [showModal, setShowModal] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'RECEITA',
    descricao: '',
    valor: 0,
    dataVencimento: '',
    categoria: 'Geral',
  });

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/financeiro/transacoes');
      setTransacoes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar transações financeiras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTransacoes();
  }, []);

  const handleCriarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/financeiro/transacoes', {
        method: 'POST',
        body: JSON.stringify({
          ...novaTransacao,
          valor: Number(novaTransacao.valor),
        }),
      });
      setShowModal(false);
      setNovaTransacao({
        tipo: 'RECEITA',
        descricao: '',
        valor: 0,
        dataVencimento: '',
        categoria: 'Geral',
      });
      carregarTransacoes();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar transação financeira.');
    }
  };

  const transacoesFiltradas = transacoes.filter((t) =>
    filtroTipo === 'TODOS' ? true : t.tipo === filtroTipo,
  );

  const totalReceita = transacoes
    .filter((t) => t.tipo === 'RECEITA')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const totalDespesa = transacoes
    .filter((t) => t.tipo === 'DESPESA')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const saldoLiquido = totalReceita - totalDespesa;

  return (
    <DashboardLayout
      title="Financeiro & Contabilidade"
      subtitle="Controle de receitas, despesas, lançamentos de ensaios e fluxo de caixa"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Transação</span>
        </button>
      }
    >
      {/* Top financial indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
            Receitas Confirmadas / Pendentes
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
            Despesas & Custos
          </span>
          <div className="text-2xl font-bold font-mono text-red-400">
            R$ {totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
            Saldo Operacional
          </span>
          <div
            className={`text-2xl font-bold font-mono ${
              saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6">
        {['TODOS', 'RECEITA', 'DESPESA'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-4 py-2 rounded-lg text-xs font-medium font-mono transition-colors ${
              filtroTipo === tipo
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Carregando transações do estúdio...
        </div>
      ) : erro ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {erro}
        </div>
      ) : transacoesFiltradas.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h4 className="font-semibold text-foreground">
            Nenhuma transação encontrada
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Registre suas primeiras entradas e saídas no sistema financeiro.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Descrição / Categoria
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Valor
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Data Vencimento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transacoesFiltradas.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1.5 text-xs font-mono uppercase px-2.5 py-1 rounded-full ${
                        t.tipo === 'RECEITA'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {t.tipo === 'RECEITA' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>{t.tipo}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {t.descricao}
                    </div>
                    {t.categoria && (
                      <div className="text-xs text-muted-foreground">
                        {t.categoria}
                      </div>
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 font-mono font-semibold ${
                      t.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-full uppercase ${
                        t.status === 'PAGO'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'PENDENTE'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                    {t.dataVencimento
                      ? new Date(t.dataVencimento).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar Transação */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground">
                Registrar Transação
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarTransacao} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Tipo
                </label>
                <select
                  value={novaTransacao.tipo}
                  onChange={(e) =>
                    setNovaTransacao({ ...novaTransacao, tipo: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="RECEITA">RECEITA (+)</option>
                  <option value="DESPESA">DESPESA (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={novaTransacao.descricao}
                  onChange={(e) =>
                    setNovaTransacao({ ...novaTransacao, descricao: e.target.value })
                  }
                  placeholder="Ex: Adiantamento Ensaio Gestante"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={novaTransacao.valor}
                  onChange={(e) =>
                    setNovaTransacao({
                      ...novaTransacao,
                      valor: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  required
                  value={novaTransacao.dataVencimento}
                  onChange={(e) =>
                    setNovaTransacao({
                      ...novaTransacao,
                      dataVencimento: e.target.value,
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-lg shadow-primary/25"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
