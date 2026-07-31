"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, User, Phone, Mail, AtSign, Eye, Trash2 } from "lucide-react";
import { getClients, createClient, deleteClient } from "@/actions/client-actions";
import { PageHeader } from "@/components/layout/page-header";
import { ClientEditDialog } from "@/components/client-edit-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    notes: "",
  });

  const loadClients = async (query?: string) => {
    setLoading(true);
    try {
      const data = await getClients(query);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients(search);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setCreating(true);
    try {
      await createClient(formData);
      setFormData({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        instagram: "",
        notes: "",
      });
      setIsModalOpen(false);
      loadClients(search);
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar cliente.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${name}"?`)) return;
    try {
      await deleteClient(id);
      loadClients(search);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir cliente.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Clientes (CRM)"
        subtitle="Gerencie a carteira de clientes do estúdio."
        action={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger>
              <button className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-violet-500 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Novo Cliente</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Mariana Silva"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="mariana@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="@marianasilva"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Anotações / Observações</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Ex: Preferência por ensaios externos..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
                  >
                    {creating ? "Salvando..." : "Salvar Cliente"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Busca */}
      <div className="mb-6 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="pl-9"
        />
      </div>

      {/* Tabela de Clientes */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="p-4 font-medium">Nome</th>
                  <th className="p-4 font-medium">Contatos</th>
                  <th className="p-4 font-medium">Instagram</th>
                  <th className="p-4 font-medium">Anotações</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Carregando clientes...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum cliente cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  clients.map((cli) => (
                    <tr key={cli.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        <Link
                          href={`/clientes/${cli.id}`}
                          className="hover:underline flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-violet-500 shrink-0" />
                          <span>{cli.name}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-muted-foreground space-y-0.5">
                        {cli.phone && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3" />
                            <span>{cli.phone}</span>
                          </div>
                        )}
                        {cli.email && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail className="w-3 h-3" />
                            <span>{cli.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {cli.instagram ? (
                          <span className="text-xs font-mono bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded">
                            {cli.instagram}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">
                        {cli.notes || "-"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/clientes/${cli.id}`}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Ver Ficha"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <ClientEditDialog
                            client={cli}
                            onSuccess={() => loadClients(search)}
                          />
                          <button
                            onClick={() => handleDelete(cli.id, cli.name)}
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-500"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
