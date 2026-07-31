"use client";

import React, { useEffect, useState } from "react";
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Calendar, Tag } from "lucide-react";
import { getExpenses, createExpense, deleteExpense } from "@/actions/expense-actions";
import { getDashboardSummary } from "@/actions/dashboard-actions";
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
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, sumData] = await Promise.all([
        getExpenses(),
        getDashboardSummary(),
      ]);
      setExpenses(expData);
      setSummary(sumData);
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

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    try {
      await deleteExpense(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir despesa.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Financeiro & Lucro Líquido"
        subtitle="Controle de receitas, despesas vinculadas a ensaios e custos fixos do estúdio."
        action={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger>
              <button className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/25 hover:bg-rose-500 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Nova Despesa</span>
              </button>
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
                    placeholder="Ex: Assinatura Adobe, Internet, Manutenção Lente"
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
                    <Label htmlFor="date">Data da Despesa *</Label>
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

      {/* KPI Cards Financial */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          title="Receita Realizada (Entradas)"
          value={formatCurrency(summary?.totalRevenue || 0)}
          description="Total de ensaios entregues/concluídos"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Despesas Acumuladas (Saídas)"
          value={formatCurrency(summary?.totalExpense || 0)}
          description="Custos fixos e despesas de ensaios"
          icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
        />
        <StatCard
          title="Lucro Líquido Real"
          value={formatCurrency(summary?.netProfit || 0)}
          description="Receita líquida disponível"
          icon={<DollarSign className="w-4 h-4 text-indigo-500" />}
          trend={{
            value: (summary?.netProfit || 0) >= 0 ? "Positivo" : "Negativo",
            positive: (summary?.netProfit || 0) >= 0,
          }}
        />
      </div>

      {/* Lista de Despesas */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Lançamentos de Despesas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="p-4 font-medium">Descrição</th>
                  <th className="p-4 font-medium">Tipo / Vínculo</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Valor</th>
                  <th className="p-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Carregando lançamentos...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhuma despesa registrada ainda.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        {exp.description}
                      </td>
                      <td className="p-4 text-xs">
                        {exp.appointment ? (
                          <span className="inline-flex items-center gap-1 bg-violet-500/10 text-violet-600 px-2.5 py-0.5 rounded font-medium">
                            <Tag className="w-3 h-3" />
                            <span>Ensaio: {exp.appointment.serviceName}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-500/10 text-gray-600 px-2.5 py-0.5 rounded font-medium">
                            <span>Despesa Geral do Estúdio</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {formatDate(exp.date)}
                      </td>
                      <td className="p-4 font-semibold text-rose-500">
                        - {formatCurrency(exp.amount)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500"
                          title="Excluir despesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
