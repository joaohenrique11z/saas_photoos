import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, AtSign, Calendar, Plus } from "lucide-react";
import { getClientById } from "@/actions/client-actions";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ClientEditDialog } from "@/components/client-edit-dialog";
import { ExpandableText } from "@/components/ui/expandable-text";
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
        subtitle="Ficha completa, preferências e histórico contábil"
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
              className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500 shadow-md shadow-pink-500/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Ensaio / Atendimento</span>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Contact Profile */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-pink-500" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Telefone/Whats:
              </span>
              <span className="font-medium text-foreground">
                {client.phone || client.whatsapp || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> E-mail:
              </span>
              <span className="font-medium text-foreground">
                {client.email || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5" /> Instagram:
              </span>
              <span className="font-medium text-pink-600 font-mono text-xs">
                {client.instagram || "-"}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground block mb-1">
                Bloco de Notas / Preferências
              </span>
              <div className="text-xs bg-muted/50 p-3 rounded-lg text-muted-foreground">
                <ExpandableText text={client.notes || ""} maxChars={150} />
              </div>
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
