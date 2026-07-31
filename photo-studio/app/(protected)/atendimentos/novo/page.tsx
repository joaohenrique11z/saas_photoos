"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, User, DollarSign, MapPin } from "lucide-react";
import { getClients } from "@/actions/client-actions";
import { createAppointment } from "@/actions/appointment-actions";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

function FormAtendimento() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") || "";

  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: preselectedClientId,
    serviceName: "",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    location: "",
    price: "",
    status: "ORCAMENTO",
    summaryNotes: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getClients();
        setClients(data);
        if (!preselectedClientId && data.length > 0) {
          setFormData((prev) => ({ ...prev, clientId: data[0].id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClients(false);
      }
    }
    load();
  }, [preselectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceName.trim() || !formData.price) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        clientId: formData.clientId,
        serviceName: formData.serviceName,
        date: new Date(formData.date),
        time: formData.time,
        location: formData.location,
        price: parseFloat(formData.price),
        status: formData.status as any,
        summaryNotes: formData.summaryNotes,
      });

      router.push("/atendimentos");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erro ao agendar atendimento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cliente */}
          <div>
            <Label htmlFor="clientId" className="flex items-center gap-1.5 mb-1">
              <User className="w-4 h-4 text-violet-500" />
              <span>Cliente *</span>
            </Label>
            {loadingClients ? (
              <Input disabled value="Carregando clientes..." />
            ) : clients.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-xs">
                Nenhum cliente cadastrado.{" "}
                <Link href="/clientes" className="underline font-semibold">
                  Cadastre um cliente primeiro
                </Link>
                .
              </div>
            ) : (
              <select
                id="clientId"
                required
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Nome do Serviço */}
          <div>
            <Label htmlFor="serviceName">Nome do Serviço / Tipo de Ensaio *</Label>
            <Input
              id="serviceName"
              required
              placeholder="Ex: Ensaio Gestante, Cobertura Casamento, Retrato Corporativo"
              value={formData.serviceName}
              onChange={(e) =>
                setFormData({ ...formData, serviceName: e.target.value })
              }
            />
          </div>

          {/* Data & Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Data do Ensaio *</span>
              </Label>
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
            <div>
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Local & Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Local</span>
              </Label>
              <Input
                id="location"
                placeholder="Ex: Estúdio Próprio ou Parque Ibirapuera"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="price" className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Valor Combinado (R$) *</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                placeholder="1200.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status Inicial */}
          <div>
            <Label htmlFor="status">Status Inicial</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ORCAMENTO">Orçamento (Proposta enviada)</option>
              <option value="AGENDADO">Agendado (Confirmado)</option>
              <option value="REALIZADO">Realizado (Sessão feita)</option>
              <option value="ENTREGUE">Entregue (Finalizado)</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Anotações do Ensaio */}
          <div>
            <Label htmlFor="summaryNotes">Bloco de Notas / Ideias do Ensaio</Label>
            <Textarea
              id="summaryNotes"
              rows={4}
              placeholder="Anotações sobre paleta de cores, figurino, inspirações..."
              value={formData.summaryNotes}
              onChange={(e) =>
                setFormData({ ...formData, summaryNotes: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/atendimentos"
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 shadow-md shadow-violet-500/25"
            >
              {submitting ? "Agendando..." : "Salvar Atendimento"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NovoAtendimentoPage() {
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
        title="Novo Atendimento"
        subtitle="Agende uma nova sessão fotográfica ou crie uma proposta."
      />

      <Suspense fallback={<div>Carregando formulário...</div>}>
        <FormAtendimento />
      </Suspense>
    </div>
  );
}
