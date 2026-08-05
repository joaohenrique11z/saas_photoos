"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Filter, Eye, User, Calendar, Search } from "lucide-react";
import { getAppointments } from "@/actions/appointment-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AppointmentEditDialog } from "@/components/appointment-edit-dialog";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { label: "Todos", value: "ALL" },
  { label: "Orçamento", value: "ORCAMENTO" },
  { label: "Agendado", value: "AGENDADO" },
  { label: "Realizado", value: "REALIZADO" },
  { label: "Entregue", value: "ENTREGUE" },
  { label: "Cancelado", value: "CANCELADO" },
];

export default function AtendimentosPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAppointments = async (status: string, query?: string) => {
    setLoading(true);
    try {
      const data = await getAppointments(status, query);
      const formattedData = data.map((item: any) => ({
        ...item,
        price: typeof item.price?.toNumber === "function" ? item.price.toNumber() : Number(item.price),
      }));
      setAppointments(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedStatus, search);
  }, [selectedStatus]);

  const filteredAppointments = appointments.filter((app) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const clientName = app.client?.name?.toLowerCase() || "";
    const clientEmail = app.client?.email?.toLowerCase() || "";
    const clientPhone = app.client?.phone?.toLowerCase() || "";
    const clientNotes = app.client?.notes?.toLowerCase() || "";
    const clientAddress = app.client?.address?.toLowerCase() || "";
    const serviceName = app.serviceName?.toLowerCase() || "";
    const location = app.location?.toLowerCase() || "";
    const summaryNotes = app.summaryNotes?.toLowerCase() || "";
    return (
      clientName.includes(s) ||
      clientEmail.includes(s) ||
      clientPhone.includes(s) ||
      clientNotes.includes(s) ||
      clientAddress.includes(s) ||
      serviceName.includes(s) ||
      location.includes(s) ||
      summaryNotes.includes(s)
    );
  });

  return (
    <div>
      <PageHeader
        title="Atendimentos"
        subtitle="Sessões fotográficas, orçamentos e entregas do estúdio."
        action={
          <Link
            href="/atendimentos/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/25 hover:bg-pink-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </Link>
        }
      />

      {/* Busca e Filtros de Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground mr-1" />
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedStatus === opt.value
                  ? "bg-pink-600 text-white font-semibold shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, serviço, anotações, local..."
            className="pl-9"
          />
        </div>
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
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum atendimento encontrado para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => {
                    const isCanceled = app.status === "CANCELADO" || app.status === "Canceled";
                    return (
                      <tr
                        key={app.id}
                        onClick={() => router.push(`/atendimentos/${app.id}`)}
                        className="hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className={cn("p-4 font-semibold text-foreground", isCanceled && "line-through opacity-60 text-gray-500")}>
                          <Link
                            href={`/clientes/${app.clientId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline flex items-center gap-1.5"
                          >
                            <User className="w-4 h-4 text-pink-500 shrink-0" />
                            <span>{app.client?.name || "Cliente indisponível"}</span>
                          </Link>
                        </td>
                        <td className={cn("p-4 font-medium text-foreground", isCanceled && "line-through opacity-60 text-gray-500")}>
                          {app.serviceName}
                        </td>
                        <td className={cn("p-4 text-muted-foreground text-xs", isCanceled && "line-through opacity-60 text-gray-500")}>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {formatDate(app.date)} às {app.time}
                            </span>
                          </div>
                        </td>
                        <td className={cn("p-4 text-xs text-muted-foreground", isCanceled && "line-through opacity-60 text-gray-500")}>
                          {app.location || "-"}
                        </td>
                        <td className={cn("p-4 font-semibold text-foreground", isCanceled && "line-through opacity-60 text-gray-500")}>
                          {formatCurrency(app.price)}
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <AppointmentEditDialog
                              appointment={{
                                ...app,
                                price: typeof app.price?.toNumber === "function" ? app.price.toNumber() : Number(app.price),
                              }}
                              onSuccess={() => loadAppointments(selectedStatus, search)}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/atendimentos/${app.id}`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detalhes</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

