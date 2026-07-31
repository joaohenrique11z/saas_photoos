"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Filter, Eye, User, Calendar } from "lucide-react";
import { getAppointments } from "@/actions/appointment-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AppointmentEditDialog } from "@/components/appointment-edit-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_OPTIONS = [
  { label: "Todos", value: "ALL" },
  { label: "Orçamento", value: "ORCAMENTO" },
  { label: "Agendado", value: "AGENDADO" },
  { label: "Realizado", value: "REALIZADO" },
  { label: "Entregue", value: "ENTREGUE" },
  { label: "Cancelado", value: "CANCELADO" },
];

export default function AtendimentosPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadAppointments = async (status: string) => {
    setLoading(true);
    try {
      const data = await getAppointments(status);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedStatus);
  }, [selectedStatus]);

  return (
    <div>
      <PageHeader
        title="Atendimentos"
        subtitle="Sessões fotográficas, orçamentos e entregas do estúdio."
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

      {/* Filtros de Status */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground mr-1" />
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedStatus(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedStatus === opt.value
                ? "bg-violet-600 text-white font-semibold shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tabela de Atendimentos */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Serviço</th>
                  <th className="p-4 font-medium">Data & Hora</th>
                  <th className="p-4 font-medium">Local</th>
                  <th className="p-4 font-medium">Preço</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Carregando atendimentos...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum atendimento encontrado para este filtro.
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        <Link
                          href={`/clientes/${app.clientId}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <User className="w-4 h-4 text-violet-500 shrink-0" />
                          <span>{app.client?.name || "Cliente indisponível"}</span>
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {app.serviceName}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {formatDate(app.date)} às {app.time}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {app.location || "-"}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        {formatCurrency(app.price)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <AppointmentEditDialog
                            appointment={app}
                            onSuccess={() => loadAppointments(selectedStatus)}
                          />
                          <Link
                            href={`/atendimentos/${app.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detalhes</span>
                          </Link>
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
    </div>
  );
}
