"use client";

import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import { updateAppointment } from "@/actions/appointment-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentEditDialogProps {
  appointment: {
    id: string;
    serviceName: string;
    date: Date | string;
    time: string;
    location?: string | null;
    price: number | string;
    status: string;
    summaryNotes?: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AppointmentEditDialog({
  appointment,
  trigger,
  onSuccess,
}: AppointmentEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: appointment.serviceName || "",
    date: new Date(appointment.date).toISOString().split("T")[0],
    time: appointment.time || "14:00",
    location: appointment.location || "",
    price: String(appointment.price || ""),
    status: appointment.status || "AGENDADO",
    summaryNotes: appointment.summaryNotes || "",
  });

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setFormData({
        serviceName: appointment.serviceName || "",
        date: new Date(appointment.date).toISOString().split("T")[0],
        time: appointment.time || "14:00",
        location: appointment.location || "",
        price: String(appointment.price || ""),
        status: appointment.status || "AGENDADO",
        summaryNotes: appointment.summaryNotes || "",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceName.trim() || !formData.price) return;

    setLoading(true);
    try {
      await updateAppointment(appointment.id, {
        serviceName: formData.serviceName,
        date: new Date(formData.date),
        time: formData.time,
        location: formData.location || undefined,
        price: parseFloat(formData.price),
        status: formData.status as any,
        summaryNotes: formData.summaryNotes || undefined,
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || "Erro ao editar atendimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : (
        <DialogTrigger
          className="p-1.5 rounded-lg hover:bg-pink-500/10 text-pink-600 dark:text-pink-400 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold border border-border bg-card px-3 py-1.5"
          title="Editar dados do atendimento"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Editar Atendimento</span>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Atendimento & Serviços</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="edit-service-name">Nome do Serviço *</Label>
            <Input
              id="edit-service-name"
              required
              placeholder="Ex: Ensaio Externo, Cobertura Casamento"
              value={formData.serviceName}
              onChange={(e) =>
                setFormData({ ...formData, serviceName: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-date">Data *</Label>
              <Input
                id="edit-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-time">Horário *</Label>
              <Input
                id="edit-time"
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-price">Valor (R$) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status *</Label>
              <select
                id="edit-status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="ORCAMENTO">Orçamento</option>
                <option value="AGENDADO">Agendado</option>
                <option value="REALIZADO">Realizado</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="edit-location">Localização / Endereço</Label>
            <Input
              id="edit-location"
              placeholder="Ex: Parque Ibirapuera, Estúdio Principal"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="edit-summary-notes">
              Anotações do Atendimento / Briefing
            </Label>
            <Textarea
              id="edit-summary-notes"
              rows={3}
              placeholder="Ex: Levar lentes auxiliares, cliente pediu iluminação suave..."
              value={formData.summaryNotes}
              onChange={(e) =>
                setFormData({ ...formData, summaryNotes: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
