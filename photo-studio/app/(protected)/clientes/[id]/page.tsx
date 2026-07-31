import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, AtSign, Calendar, Plus } from "lucide-react";
import { getClientById } from "@/actions/client-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ClientEditDialog } from "@/components/client-edit-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FichaClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Clientes</span>
        </Link>
      </div>

      <PageHeader
        title={client.name}
        subtitle="Ficha detalhada do cliente, dados de contato e histórico de ensaios."
        action={
          <div className="flex items-center gap-2">
            <ClientEditDialog
              client={client}
              trigger={
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  <span>Editar Cliente</span>
                </button>
              }
            />
            <Link
              href={`/atendimentos/novo?clientId=${client.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-violet-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Atendimento para Este Cliente</span>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="border shadow-sm h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-violet-500" />
              <span>Dados de Contato</span>
            </CardTitle>
            <ClientEditDialog client={client} />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Telefone</span>
              <span className="font-medium">{client.phone || "-"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">WhatsApp</span>
              <span className="font-medium">{client.whatsapp || "-"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">E-mail</span>
              <span className="font-medium">{client.email || "-"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Instagram</span>
              <span className="font-medium text-violet-600 font-mono text-xs">
                {client.instagram || "-"}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground block mb-1">
                Bloco de Notas / Preferências
              </span>
              <p className="text-xs bg-muted/50 p-3 rounded-lg text-muted-foreground whitespace-pre-wrap">
                {client.notes || "Nenhuma anotação cadastrada."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointments History */}
        <Card className="border shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Histórico de Atendimentos ({client.appointments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum ensaio ou atendimento registrado para este cliente ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {client.appointments.map((app) => (
                  <Link
                    key={app.id}
                    href={`/atendimentos/${app.id}`}
                    className="block p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">
                        {app.serviceName}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        📅 {formatDate(app.date)} às {app.time}
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {formatCurrency(Number(app.price))}
                      </span>
                    </div>
                    {app.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {app.location}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
