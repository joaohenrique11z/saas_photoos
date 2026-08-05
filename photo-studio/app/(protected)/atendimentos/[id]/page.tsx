"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  MapPin,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import {
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
} from "@/actions/appointment-actions";
import { createExpense, deleteExpense } from "@/actions/expense-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge, AppointmentStatus } from "@/components/status-badge";
import { AppointmentEditDialog } from "@/components/appointment-edit-dialog";
import { ExpandableText } from "@/components/ui/expandable-text";
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

export default function FichaAtendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Despesa Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
  });
  const [creatingExpense, setCreatingExpense] = useState(false);

  const loadData = async () => {
    try {
      const data = await getAppointmentById(id);
      if (data) {
        data.price = typeof data.price?.toNumber === "function" ? data.price.toNumber() : Number(data.price);
      }
      setAppointment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setUpdatingStatus(true);
    try {
      await updateAppointmentStatus(id, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este atendimento?")) return;
    try {
      await deleteAppointment(id);
      router.push("/atendimentos");
    } catch (err: any) {
      alert(err.message || "Erro ao excluir atendimento.");
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.description || !expenseData.amount) return;

    setCreatingExpense(true);
    try {
      await createExpense({
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        date: new Date(),
        appointmentId: id,
      });
      setExpenseData({ description: "", amount: "" });
      setIsExpenseModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao registrar despesa.");
    } finally {
      setCreatingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir despesa.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Atendimento não encontrado.
      </div>
    );
  }

  const totalExpenses = appointment.expenses.reduce(
    (acc: number, e: any) => acc + Number(e.amount),
    0
  );
  const netProfit = Number(appointment.price) - totalExpenses;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/atendimentos"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Atendimentos</span>
        </Link>
      </div>

      <PageHeader
        title={appointment.serviceName}
        subtitle={`Atendimento com ${appointment.client?.name || "Cliente"}`}
        action={
          <div className="flex items-center gap-2">
            <AppointmentEditDialog
              appointment={{
                ...appointment,
                price: typeof appointment.price?.toNumber === "function" ? appointment.price.toNumber() : Number(appointment.price),
              }}
              onSuccess={loadData}
            />
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Atendimento</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Painel Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Card de Status & Troca Rápida */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status Atual do Ensaio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <StatusBadge status={appointment.status} className="text-sm py-1 px-3" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">Alterar:</span>
                  {(["ORCAMENTO", "AGENDADO", "REALIZADO", "ENTREGUE", "CANCELADO"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        disabled={updatingStatus || appointment.status === st}
                        onClick={() => handleStatusChange(st)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                          appointment.status === st
                            ? "bg-muted font-bold opacity-60"
                            : "hover:bg-muted/70"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anotações do Ensaio */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-500" />
                <span>Bloco de Notas do Ensaio</span>
              </CardTitle>
              <AppointmentEditDialog
                appointment={{
                  ...appointment,
                  price: typeof appointment.price?.toNumber === "function" ? appointment.price.toNumber() : Number(appointment.price),
                }}
                onSuccess={loadData}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Anotações / Ensaio</span>
                  </button>
                }
              />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-foreground bg-muted/30 p-4 rounded-xl min-h-[100px]">
                <ExpandableText
                  text={appointment.summaryNotes}
                  maxChars={180}
                />
              </div>
            </CardContent>
          </Card>

          {/* Despesas Vinculadas a este Ensaio */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-500" />
                <span>Despesas Diretas deste Ensaio ({appointment.expenses.length})</span>
              </CardTitle>
              <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                <DialogTrigger className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Despesa</span>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Nova Despesa para o Ensaio</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="desc">Descrição da Despesa *</Label>
                      <Input
                        id="desc"
                        required
                        placeholder="Ex: Maquiador, Aluguel de Lente, Uber"
                        value={expenseData.description}
                        onChange={(e) =>
                          setExpenseData({
                            ...expenseData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="amt">Valor (R$) *</Label>
                      <Input
                        id="amt"
                        type="number"
                        step="0.01"
                        required
                        placeholder="150.00"
                        value={expenseData.amount}
                        onChange={(e) =>
                          setExpenseData({ ...expenseData, amount: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsExpenseModalOpen(false)}
                        className="px-3 py-1.5 text-xs rounded-md border"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={creatingExpense}
                        className="px-3 py-1.5 text-xs rounded-md bg-rose-600 text-white font-semibold"
                      >
                        {creatingExpense ? "Salvando..." : "Salvar Despesa"}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {appointment.expenses.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Nenhuma despesa vinculada a este ensaio.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {appointment.expenses.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium text-foreground">
                          {exp.description}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {formatDate(exp.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-rose-500">
                          - {formatCurrency(exp.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com Resumo Financeiro do Ensaio & Dados do Cliente */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Lucro Líquido do Ensaio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Valor Bruto:</span>
                <span className="font-semibold">{formatCurrency(appointment.price)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border text-rose-500">
                <span>(-) Despesas Vinculadas:</span>
                <span>- {formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold text-emerald-600">
                <span>Lucro Líquido:</span>
                <span>{formatCurrency(netProfit)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-pink-500" />
                <span>Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Nome</span>
                <Link
                  href={`/clientes/${appointment.clientId}`}
                  className="font-semibold text-pink-600 hover:underline"
                >
                  {appointment.client?.name || "Cliente"}
                </Link>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Telefone</span>
                <span>{appointment.client?.phone || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">E-mail</span>
                <span>{appointment.client?.email || "-"}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground block">
                    Data & Hora do Ensaio
                  </span>
                  <AppointmentEditDialog
                    appointment={{
                      ...appointment,
                      price: typeof appointment.price?.toNumber === "function" ? appointment.price.toNumber() : Number(appointment.price),
                    }}
                    onSuccess={loadData}
                    trigger={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    }
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted p-2 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {formatDate(appointment.date)} às {appointment.time}
                  </span>
                </div>
              </div>
              {appointment.location && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Local</span>
                  <div className="flex items-center gap-1.5 text-xs text-foreground bg-muted p-2 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{appointment.location}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
