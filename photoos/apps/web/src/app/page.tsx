'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { fetchApi } from '../lib/api';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const data = await fetchApi('/relatorios/dashboard/resumo');
        setResumo(data);
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Visão Geral do Estúdio">
        <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">
          Carregando indicadores financeiros e operacionais...
        </div>
      </DashboardLayout>
    );
  }

  if (erro) {
    return (
      <DashboardLayout title="Visão Geral do Estúdio">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {erro}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Visão Geral do Estúdio"
      subtitle="KPIs de faturamento, margem de lucro e progresso de ensaios fotográficos"
      actions={
        <Link
          href="/ensaios"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ensaio</span>
        </Link>
      }
    >
      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Receita
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            R$ {Number(resumo?.financeiro?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-muted-foreground mt-2 inline-block">
            Entradas confirmadas no período
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Despesas
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            R$ {Number(resumo?.financeiro?.despesaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-muted-foreground mt-2 inline-block">
            Saídas e custos vinculados
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Lucro Líquido
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-3xl font-bold tracking-tight ${
              Number(resumo?.financeiro?.lucroLiquido || 0) >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            R$ {Number(resumo?.financeiro?.lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-muted-foreground mt-2 inline-block">
            Resultado operacional real
          </span>
        </div>
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
              Agendados
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {resumo?.ensaios?.agendados || 0}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
              Em Andamento
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {resumo?.ensaios?.emAndamento || 0}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
              Em Edição
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {resumo?.ensaios?.edicao || 0}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
              Entregues
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {resumo?.ensaios?.entregues || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown de Status Tabela */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-base mb-4 text-foreground">
          Distribuição Geral de Ensaios por Status
        </h3>
        {resumo?.statusBreakdown && resumo.statusBreakdown.length > 0 ? (
          <div className="space-y-3">
            {resumo.statusBreakdown.map((item: any) => (
              <div
                key={item.status}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.status}
                </span>
                <span className="text-sm font-mono font-semibold text-primary">
                  {item._count?.id || 0} ensaios
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum ensaio registrado para exibir estatísticas de status.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
