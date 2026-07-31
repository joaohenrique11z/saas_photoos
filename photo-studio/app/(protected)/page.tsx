import React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getDashboardSummary } from "@/actions/dashboard-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumo geral de clientes, atendimentos e resultados do estúdio."
        action={
          <Link
            href="/atendimentos/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-violet-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total de Clientes"
          value={summary.totalClients}
          description="Cadastrados no estúdio"
          icon={<Users className="w-4 h-4 text-violet-500" />}
        />
        <StatCard
          title="Atendimentos"
          value={summary.totalAppointments}
          description={`${summary.realizedAppointments} realizados`}
          icon={<Calendar className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Receita Realizada"
          value={formatCurrency(summary.totalRevenue)}
          description="Soma dos serviços concluídos"
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(summary.netProfit)}
          description={`Despesas: ${formatCurrency(summary.totalExpense)}`}
          icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
          trend={{
            value:
              summary.netProfit >= 0
                ? "Saldo Positivo"
                : "Atenção (Negativo)",
            positive: summary.netProfit >= 0,
          }}
        />
      </div>

      {/* Recent Appointments */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">
              Próximos & Recentes Atendimentos
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Últimas sessões agendadas ou realizadas
            </CardDescription>
          </div>
          <Link
            href="/atendimentos"
            className="text-xs font-semibold text-violet-600 hover:text-violet-500 inline-flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Serviço</th>
                  <th className="pb-3 font-medium">Data & Hora</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.recentAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground text-xs"
                    >
                      Nenhum atendimento cadastrado.
                    </td>
                  </tr>
                ) : (
                  summary.recentAppointments.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 font-medium text-foreground">
                        <Link
                          href={`/clientes/${app.clientId}`}
                          className="hover:underline"
                        >
                          {app.client?.name || "Cliente sem nome"}
                        </Link>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {app.serviceName}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(app.date)} às {app.time}
                      </td>
                      <td className="py-3 font-medium text-foreground">
                        {formatCurrency(app.price)}
                      </td>
                      <td className="py-3 text-right">
                        <StatusBadge status={app.status} />
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
