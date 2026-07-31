"use client";

import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import { updateClient } from "@/actions/client-actions";
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

interface ClientEditDialogProps {
  client: {
    id: string;
    name: string;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    instagram?: string | null;
    notes?: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ClientEditDialog({
  client,
  trigger,
  onSuccess,
}: ClientEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name || "",
    phone: client.phone || "",
    whatsapp: client.whatsapp || "",
    email: client.email || "",
    instagram: client.instagram || "",
    notes: client.notes || "",
  });

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        whatsapp: client.whatsapp || "",
        email: client.email || "",
        instagram: client.instagram || "",
        notes: client.notes || "",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await updateClient(client.id, {
        name: formData.name,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email || undefined,
        instagram: formData.instagram || undefined,
        notes: formData.notes || undefined,
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || "Erro ao editar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {trigger ? (
          trigger
        ) : (
          <button
            className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
            title="Editar dados e anotações do cliente"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente & Anotações</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="edit-client-name">Nome Completo *</Label>
            <Input
              id="edit-client-name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-client-phone">Telefone</Label>
              <Input
                id="edit-client-phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-client-whatsapp">WhatsApp</Label>
              <Input
                id="edit-client-whatsapp"
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-client-email">E-mail</Label>
              <Input
                id="edit-client-email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-client-instagram">Instagram</Label>
              <Input
                id="edit-client-instagram"
                placeholder="@perfil"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-client-notes">
              Anotações e Preferências do Cliente
            </Label>
            <Textarea
              id="edit-client-notes"
              rows={4}
              placeholder="Ex: Prefere ensaios ao ar livre, melhor horário no fim da tarde..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
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
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
