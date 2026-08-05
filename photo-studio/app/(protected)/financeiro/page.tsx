"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Tag,
  Edit2,
  BarChart2,
  ArrowUpRight,
  Users,
} from "lucide-react";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/actions/expense-actions";
import {
  getDashboardSummary,
  getFinancialMonthlyReport,
} from "@/actions/dashboard-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function FinanceiroPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Month selector (0 to 11)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(
    new Date().getMonth()
  );

  // Create Expense modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Edit Expense modal
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    amount: "",
    date: "",
  });
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, sumData, reportData] = await Promise.all([
        getExpenses(),
        getDashboardSummary(),
        getFinancialMonthlyReport(),
      ]);
      setExpenses(expData);
      setSummary(sumData);
      setReport(reportData);

      // Default selected month to the first month with appointments/revenue or current month
      if (reportData && reportData.monthlyData) {
        const monthsWithData = reportData.monthlyData.filter(
          (m: any) => m.revenue > 0 || m.expenses > 0
        );
        if (monthsWithData.length > 0) {
          setSelectedMonthIdx(monthsWithData[monthsWithData.length - 1].monthIndex);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    setCreating(true);
    try {
      await createExpense({
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
      });

      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar despesa.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (exp: any) => {
    setEditingExpense(exp);
    setEditFormData({
      description: exp.description,
      amount: String(exp.amount),
      date: new Date(exp.date).toISOString().split("T")[0],
    });
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editFormData.description || !editFormData.amount)
      return;

    setUpdating(true);
    try {
      await updateExpense(editingExpense.id, {
        description: editFormData.description,
        amount: parseFloat(editFormData.amount),
        date: new Date(editFormData.date),
      });
      setEditingExpense(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao editar despesa.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    try {
      await deleteExpense(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir despesa.");
    }
  };

  const selectedMonthData = report?.monthlyData?.find(
    (m: any) => m.monthIndex === selectedMonthIdx
  ) || {
    monthName: "Janeiro",
    appointmentsCount: 0,
    clientsCount: 0,
    revenue: 0,
    expenses: 0,
    profit: 0,
    appointmentsList: [],
    expensesList: [],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Financeiro & Contabilidade"
        subtitle="Organização mensal de receitas, despesas, margem de lucro e gráficos estatísticos."
        action={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-600/25 hover:bg-rose-500 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Nova Despesa</span>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nova Despesa do Estúdio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateExpense} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="description">Descrição da Despesa *</Label>
                  <Input
                    id="description"
                    required
                    placeholder="Ex: Assinatura Software, Manutenção Lente, Aluguel"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      placeholder="180.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    {creating ? "Salvando..." : "Salvar Despesa"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Receita Concluída"
          value={formatCurrency(summary?.totalRevenue || 0)}
          description="Soma dos atendimentos realizados"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Despesas Acumuladas"
          value={formatCurrency(summary?.totalExpense || 0)}
          description="Saídas e custos registrados"
          icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
        />
        <StatCard
          title="Lucro Líquido Real"
          value={formatCurrency(summary?.netProfit || 0)}
          description="Resultado contábil geral"
          icon={<DollarSign className="w-4 h-4 text-indigo-500" />}
          trend={{
            value: (summary?.netProfit || 0) >= 0 ? "Positivo" : "Atenção",
            positive: (summary?.netProfit || 0) >= 0,
          }}
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(report?.averageTicket || 0)}
          description="Média por atendimento entregue"
          icon={<BarChart2 className="w-4 h-4 text-pink-500" />}
        />
        <StatCard
          title="Novos Clientes no Ano"
          value={report?.totalNewClients || 0}
          description="Crescimento da carteira CRM"
          icon={<Users className="w-4 h-4 text-blue-500" />}
        />
      </div>



      {/* MONTHLY ORGANIZED SECTION (Janeiro, Fevereiro, Março...) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Relatório Contábil Mensal
            </h2>
            <p className="text-xs text-muted-foreground">
              Selecione o mês abaixo para inspecionar atendimentos, clientes,
              receitas e despesas.
            </p>
          </div>

          {/* Month Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {report?.monthlyData?.map((m: any) => {
              const active = m.monthIndex === selectedMonthIdx;
              const hasMovement = m.revenue > 0 || m.expenses > 0;
              return (
                <button
                  key={m.monthIndex}
                  onClick={() => setSelectedMonthIdx(m.monthIndex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${active
                      ? "bg-pink-600 text-white font-semibold shadow-md shadow-pink-600/25"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <span>{m.monthName}</span>
                  {hasMovement && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white" : "bg-pink-500"
                        }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Summary Card */}
        <Card className="border border-border/40 shadow-sm overflow-hidden bg-card">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {selectedMonthData.monthName} de {report?.year || 2026}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resumo contábil do mês selecionado
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold border border-emerald-500/20">
                  Receita: {formatCurrency(selectedMonthData.revenue)}
                </div>
                <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg font-semibold border border-rose-500/20">
                  Despesas: {formatCurrency(selectedMonthData.expenses)}
                </div>
                <div className="bg-pink-500/10 text-pink-600 dark:text-pink-300 px-3 py-1.5 rounded-lg font-bold border border-pink-500/20">
                  Lucro Mês: {formatCurrency(selectedMonthData.profit)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: Atendimentos no Mês */}
              <div className="bg-muted/20 border border-border/60 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Atendimentos ({selectedMonthData.appointmentsCount})
                </span>
                <p className="text-2xl font-bold text-foreground">
                  {selectedMonthData.appointmentsCount} serviços
                </p>
                <p className="text-xs text-muted-foreground">
                  Atendendo a {selectedMonthData.clientsCount} cliente(s) no mês
                </p>
              </div>

              {/* Box 2: Total de Receitas */}
              <div className="bg-muted/20 border border-border/60 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Receita Realizada
                </span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedMonthData.revenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Serviços entregues ou concluídos
                </p>
              </div>

              {/* Box 3: Lucratividade no Mês */}
              <div className="bg-muted/20 border border-border/60 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Lucratividade %
                </span>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedMonthData.revenue > 0
                    ? `${Math.round(
                      (selectedMonthData.profit / selectedMonthData.revenue) *
                      100
                    )}%`
                    : "0%"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margem líquida após dedução de despesas
                </p>
              </div>
            </div>

            {/* Subtable: Monthly Appointments & Expenses details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left: Appointments in Month */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Receitas / Atendimentos no Mês</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({selectedMonthData.appointmentsList.length})
                  </span>
                </h3>
                {selectedMonthData.appointmentsList.length === 0 ? (
                  <div className="p-6 rounded-xl border border-border/60 bg-muted/20 text-center text-xs text-muted-foreground">
                    Nenhum atendimento faturado no mês de{" "}
                    {selectedMonthData.monthName}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMonthData.appointmentsList.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {a.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.clientName} &bull; {formatDate(a.date)}
                          </p>
                        </div>
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          + {formatCurrency(a.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Expenses in Month */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Despesas no Mês</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    ({selectedMonthData.expensesList.length})
                  </span>
                </h3>
                {selectedMonthData.expensesList.length === 0 ? (
                  <div className="p-6 rounded-xl border border-border/60 bg-muted/20 text-center text-xs text-muted-foreground">
                    Nenhuma despesa registrada no mês de{" "}
                    {selectedMonthData.monthName}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMonthData.expensesList.map((exp: any) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {exp.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(exp.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-rose-500">
                            - {formatCurrency(exp.amount)}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(exp)}
                              className="p-1.5 rounded-md hover:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                              title="Editar despesa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500"
                              title="Excluir despesa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Expenses Master Table */}
      <Card className="border border-border/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Todos os Lançamentos de Despesas (Geral)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Histórico completo de despesas gerais e vinculadas a atendimentos
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs font-mono font-semibold text-muted-foreground uppercase">
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Tipo / Vínculo</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground text-xs"
                    >
                      Carregando lançamentos...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground text-xs"
                    >
                      Nenhuma despesa registrada ainda.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-semibold text-foreground">
                        {exp.description}
                      </td>
                      <td className="p-4 text-xs">
                        {exp.appointment ? (
                          <span className="inline-flex items-center gap-1 bg-pink-500/10 text-pink-600 dark:text-pink-300 px-2.5 py-1 rounded-md font-medium border border-pink-500/20">
                            <Tag className="w-3 h-3" />
                            <span>
                              Atendimento: {exp.appointment.serviceName}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-500/10 text-muted-foreground px-2.5 py-1 rounded-md font-medium border border-border">
                            <span>Despesa Geral do Estúdio</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-mono">
                        {formatDate(exp.date)}
                      </td>
                      <td className="p-4 font-bold text-rose-500">
                        - {formatCurrency(exp.amount)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(exp)}
                            className="p-1.5 rounded-lg hover:bg-pink-500/10 text-pink-600 dark:text-pink-400 transition-colors"
                            title="Editar despesa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Expense Modal */}
      <Dialog
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) setEditingExpense(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Despesa do Estúdio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateExpense} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="edit-description">Descrição da Despesa *</Label>
              <Input
                id="edit-description"
                required
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-amount">Valor (R$) *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  required
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Data *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  required
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-50"
              >
                {updating ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
