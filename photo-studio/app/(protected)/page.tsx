import React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Phone,
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

  const growthFormatted =
    summary.monthlyGrowth > 0
      ? `+${summary.monthlyGrowth.toFixed(1)}% vs. mês anterior`
      : `${summary.monthlyGrowth.toFixed(1)}% vs. mês anterior`;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Painel de Controle"
        subtitle="Visão instantânea de atendimentos de hoje, próximos horários, finanças do dia e clientes recentes."
        action={
          <Link
            href="/atendimentos/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pink-600/25 hover:bg-pink-500 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </Link>
        }
      />

      {/* Primary KPI Grid (Daily, Monthly, Pending, Profit) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Faturamento do Mês"
          value={formatCurrency(summary.monthlyRevenue)}
          description="Serviços realizados no mês atual"
          icon={<TrendingUp className="w-4 h-4 text-pink-500" />}
          trend={{
            value: growthFormatted,
            positive: summary.monthlyGrowth >= 0,
          }}
        />
        <StatCard
          title="Faturamento de Hoje"
          value={formatCurrency(summary.dailyRevenue)}
          description="Entradas realizadas no dia de hoje"
          icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="A Receber / Orçamentos"
          value={formatCurrency(summary.pendingPayments)}
          description="Soma de agendamentos e orçamentos em aberto"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Lucro Líquido Real"
          value={formatCurrency(summary.netProfit)}
          description={`Receita ${formatCurrency(
            summary.totalRevenue
          )} - Despesas`}
          icon={<DollarSign className="w-4 h-4 text-indigo-500" />}
          trend={{
            value:
              summary.netProfit >= 0
                ? "Saldo Positivo"
                : "Atenção (Negativo)",
            positive: summary.netProfit >= 0,
          }}
        />
      </div>

      {/* Main Workspace Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's & Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    Atendimentos de Hoje
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Sessões e serviços programados para o dia de hoje
                  </CardDescription>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold bg-pink-500/10 text-pink-600 px-2.5 py-1 rounded-md">
                {summary.todayAppointments.length} agendado(s)
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {summary.todayAppointments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
                  <p className="font-medium text-foreground">
                    Nenhum atendimento marcado para hoje
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seu dia está livre ou você pode agendar um novo serviço.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {summary.todayAppointments.map((app: any) => (
                    <Link
                      key={app.id}
                      href={`/atendimentos/${app.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/40 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-muted flex flex-col items-center justify-center text-xs font-bold font-mono text-foreground shrink-0 border border-border/60">
                          <span>{app.time}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground hover:underline">
                            {app.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cliente:{" "}
                            <span className="font-medium text-foreground">
                              {app.client?.name || "Sem nome"}
                            </span>
                          </p>
                          {app.location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-pink-500" />
                              <span>{app.location}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <StatusBadge status={app.status} />
                        <span className="font-semibold text-sm text-foreground">
                          {formatCurrency(app.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Próximos Atendimentos
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Sessões agendadas para os próximos dias
                </CardDescription>
              </div>
              <Link
                href="/atendimentos"
                className="text-xs font-semibold text-pink-600 hover:text-pink-500 inline-flex items-center gap-1"
              >
                <span>Ver agenda completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground font-mono uppercase bg-muted/20">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Serviço</th>
                      <th className="py-3 px-4">Data & Hora</th>
                      <th className="py-3 px-4">Valor</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.upcomingAppointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground text-xs"
                        >
                          Nenhum atendimento futuro programado.
                        </td>
                      </tr>
                    ) : (
                      summary.upcomingAppointments.map((app: any) => (
                        <tr
                          key={app.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            <Link
                              href={`/clientes/${app.clientId}`}
                              className="hover:underline"
                            >
                              {app.client?.name || "Sem nome"}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            <Link
                              href={`/atendimentos/${app.id}`}
                              className="hover:underline text-foreground font-medium"
                            >
                              {app.serviceName}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground text-xs font-mono">
                            {formatDate(app.date)} às {app.time}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-foreground">
                            {formatCurrency(app.price)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
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

        {/* Right Column (1 span): Recent Clients & Studio Pulse */}
        <div className="space-y-6">
          {/* Recent Clients */}
          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    Clientes Recentes
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Últimos contatos cadastrados no CRM
                  </CardDescription>
                </div>
              </div>
              <Link
                href="/clientes"
                className="text-xs font-semibold text-pink-600 hover:text-pink-500"
              >
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {summary.recentClients.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  Nenhum cliente cadastrado ainda.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {summary.recentClients.map((client: any) => {
                    const initials =
                      client.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "CL";

                    return (
                      <Link
                        key={client.id}
                        href={`/clientes/${client.id}`}
                        className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-indigo-500/20 flex items-center justify-center text-pink-700 dark:text-pink-300 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {client.phone || client.email || "Sem contato"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Ver ficha &rarr;
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Studio Pulse Summary */}
          <Card className="border border-border/40 shadow-sm bg-gradient-to-br from-card via-card to-muted/40">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Resumo Acumulado do Estúdio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs text-muted-foreground">
                  Total de Clientes no CRM
                </span>
                <span className="font-bold text-sm text-foreground">
                  {summary.totalClients} clientes
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs text-muted-foreground">
                  Atendimentos Concluídos
                </span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {summary.realizedAppointments} de {summary.totalAppointments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Receita Total Concluída
                </span>
                <span className="font-bold text-sm text-foreground">
                  {formatCurrency(summary.totalRevenue)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
