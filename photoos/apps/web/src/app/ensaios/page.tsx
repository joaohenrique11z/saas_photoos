'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { fetchApi } from '../../lib/api';
import {
  Camera,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowRight,
  ListTodo,
  X,
} from 'lucide-react';

const statusCores: Record<string, string> = {
  ORCAMENTO_ENVIADO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  AGUARDANDO_RESPOSTA: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMADO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  AGENDADO: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  EM_ANDAMENTO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EDICAO: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  SELECAO_CLIENTE: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  ENTREGUE: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  FINALIZADO: 'bg-green-500/10 text-green-400 border-green-500/20',
  CANCELADO: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function EnsaiosPage() {
  const [ensaios, setEnsaios] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Workflow / Profit modal
  const [ensaioSelecionado, setEnsaioSelecionado] = useState<any | null>(null);
  const [lucroEnsaio, setLucroEnsaio] = useState<any | null>(null);

  // New Ensaio Modal
  const [showModal, setShowModal] = useState(false);
  const [novoEnsaio, setNovoEnsaio] = useState({
    clienteId: '',
    servicoId: '',
    dataHora: '',
    precoCobrado: 0,
    observacoes: '',
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [ensaiosData, clientesData, servicosData] = await Promise.all([
        fetchApi('/ensaios'),
        fetchApi('/clientes'),
        fetchApi('/servicos'),
      ]);
      setEnsaios(Array.isArray(ensaiosData) ? ensaiosData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setServicos(Array.isArray(servicosData) ? servicosData : []);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar ensaios e serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleMudarStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/ensaios/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao transicionar status do ensaio.');
    }
  };

  const handleVerDetalhes = async (ensaio: any) => {
    setEnsaioSelecionado(ensaio);
    try {
      const calc = await fetchApi(`/financeiro/ensaio/${ensaio.id}/lucro-liquido`);
      setLucroEnsaio(calc);
    } catch {
      setLucroEnsaio(null);
    }
  };

  const handleCriarEnsaio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/ensaios', {
        method: 'POST',
        body: JSON.stringify({
          ...novoEnsaio,
          precoCobrado: Number(novoEnsaio.precoCobrado),
        }),
      });
      setShowModal(false);
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar ensaio.');
    }
  };

  return (
    <DashboardLayout
      title="Ensaios & Projetos"
      subtitle="Pipeline de fotografia, máquina de estados com tarefas automáticas e cálculo de lucratividade"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Ensaio</span>
        </button>
      }
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Carregando pipeline de ensaios...
        </div>
      ) : erro ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {erro}
        </div>
      ) : ensaios.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h4 className="font-semibold text-foreground">
            Nenhum ensaio ou projeto em andamento
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Agende um ensaio fotográfico para iniciar o workflow automatizado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ensaios.map((ensaio) => (
            <div
              key={ensaio.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-mono uppercase px-2.5 py-1 rounded-full border ${
                      statusCores[ensaio.status] ||
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {ensaio.status}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(ensaio.dataHora).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-foreground">
                  {ensaio.servico?.nome || 'Serviço de Fotografia'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliente: <strong className="text-foreground">{ensaio.cliente?.nomeCompleto}</strong>
                </p>

                <div className="mt-4 flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground">Valor</span>
                  <span className="font-mono font-semibold text-foreground">
                    R$ {Number(ensaio.precoCobrado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <select
                  value={ensaio.status}
                  onChange={(e) => handleMudarStatus(ensaio.id, e.target.value)}
                  className="bg-muted border border-border rounded-lg text-xs px-2.5 py-1.5 text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="ORCAMENTO_ENVIADO">ORÇAMENTO ENVIADO</option>
                  <option value="AGENDADO">AGENDADO</option>
                  <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                  <option value="EDICAO">EDIÇÃO</option>
                  <option value="SELECAO_CLIENTE">SELEÇÃO DO CLIENTE</option>
                  <option value="ENTREGUE">ENTREGUE</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>

                <button
                  onClick={() => handleVerDetalhes(ensaio)}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-primary hover:underline"
                >
                  <span>Detalhes & Lucro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ensaio Detalhes / Lucro Líquido / Workflow Modal */}
      {ensaioSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Ensaio — {ensaioSelecionado.servico?.nome}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Cliente: {ensaioSelecionado.cliente?.nomeCompleto}
                </span>
              </div>
              <button
                onClick={() => setEnsaioSelecionado(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profit calculation section */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                Rentabilidade e Lucro Líquido
              </h4>
              {lucroEnsaio ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita Bruta:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      R$ {Number(lucroEnsaio.receitaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Despesas / Custos:</span>
                    <span className="font-mono text-red-400 font-medium">
                      - R$ {Number(lucroEnsaio.despesaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Lucro Líquido:</span>
                    <span
                      className={`font-mono ${
                        Number(lucroEnsaio.lucroLiquido) >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      R$ {Number(lucroEnsaio.lucroLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Sem dados financeiros processados para este ensaio.
                </p>
              )}
            </div>

            {/* Workflow checklist display */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center space-x-1.5">
                <ListTodo className="w-4 h-4" />
                <span>Checklist do Workflow Automático</span>
              </h4>
              {ensaioSelecionado.tarefas && ensaioSelecionado.tarefas.length > 0 ? (
                <div className="space-y-2">
                  {ensaioSelecionado.tarefas.map((tarefa: any) => (
                    <div
                      key={tarefa.id}
                      className="flex items-center space-x-3 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-sm"
                    >
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${
                          tarefa.concluida ? 'text-emerald-400' : 'text-muted-foreground'
                        }`}
                      />
                      <span className={tarefa.concluida ? 'line-through text-muted-foreground' : 'text-foreground'}>
                        {tarefa.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  As tarefas do workflow são criadas automaticamente quando o status é transicionado para AGENDADO.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Novo Ensaio Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground">
                Agendar Novo Ensaio
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarEnsaio} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Cliente
                </label>
                <select
                  required
                  value={novoEnsaio.clienteId}
                  onChange={(e) =>
                    setNovoEnsaio({ ...novoEnsaio, clienteId: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nomeCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Serviço Fotográfico
                </label>
                <select
                  required
                  value={novoEnsaio.servicoId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const serv = servicos.find((s) => s.id === sId);
                    setNovoEnsaio({
                      ...novoEnsaio,
                      servicoId: sId,
                      precoCobrado: serv ? serv.precoPadrao : 0,
                    });
                  }}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Selecione o tipo de ensaio...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — R$ {Number(s.precoPadrao).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Data e Horário
                </label>
                <input
                  type="datetime-local"
                  required
                  value={novoEnsaio.dataHora}
                  onChange={(e) =>
                    setNovoEnsaio({ ...novoEnsaio, dataHora: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Valor Cobrado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={novoEnsaio.precoCobrado}
                  onChange={(e) =>
                    setNovoEnsaio({
                      ...novoEnsaio,
                      precoCobrado: parseFloat(e.target.value) || 0,
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
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
