'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { fetchApi } from '../../lib/api';
import {
  Users,
  Plus,
  Search,
  History,
  Mail,
  Phone,
  UserCheck,
  X,
} from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');

  // Timeline modal / drawer
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // New Client Modal
  const [showModal, setShowModal] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nomeCompleto: '',
    email: '',
    whatsapp: '',
    cpfCnpj: '',
    endereco: '',
  });

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/clientes');
      setClientes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErro(err.message || 'Erro ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleVerTimeline = async (cliente: any) => {
    setSelectedCliente(cliente);
    setLoadingTimeline(true);
    try {
      const data = await fetchApi(`/clientes/${cliente.id}/timeline`);
      setTimeline(Array.isArray(data) ? data : []);
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar timeline.');
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleCriarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/clientes', {
        method: 'POST',
        body: JSON.stringify({
          nomeCompleto: novoCliente.nomeCompleto,
          email: novoCliente.email,
          whatsapp: novoCliente.whatsapp,
          cpf: novoCliente.cpfCnpj,
          endereco: novoCliente.endereco,
        }),
      });
      setShowModal(false);
      setNovoCliente({
        nomeCompleto: '',
        email: '',
        whatsapp: '',
        cpfCnpj: '',
        endereco: '',
      });
      carregarClientes();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar cliente.');
    }
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nomeCompleto?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp?.includes(search),
  );

  return (
    <DashboardLayout
      title="CRM de Clientes"
      subtitle="Gestão centralizada de clientes com histórico de interações e timeline"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      }
    >
      {/* Search filter */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou whatsapp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Carregando clientes do estúdio...
        </div>
      ) : erro ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {erro}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h4 className="font-semibold text-foreground">
            Nenhum cliente encontrado
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre seu primeiro cliente no estúdio para iniciar o CRM.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  E-mail
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientesFiltrados.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {cliente.nomeCompleto?.charAt(0) || 'C'}
                    </div>
                    <span>{cliente.nomeCompleto}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{cliente.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{cliente.whatsapp || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleVerTimeline(cliente)}
                      className="inline-flex items-center space-x-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Ver Timeline</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Historical Drawer / Modal */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg h-full bg-card border-l border-border p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Timeline — {selectedCliente.nomeCompleto}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Histórico unificado de ensaios, contratos e comunicações
                </span>
              </div>
              <button
                onClick={() => setSelectedCliente(null)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingTimeline ? (
              <div className="py-12 text-center text-muted-foreground animate-pulse">
                Carregando histórico do cliente...
              </div>
            ) : timeline.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Nenhum evento registrado nesta timeline ainda.
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-border">
                {timeline.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 relative pl-2"
                  >
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-card relative z-10 shrink-0 mt-1" />
                    <div className="flex-1 bg-muted/40 border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                          {event.tipo}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(event.criadoEm).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {event.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground">
                Cadastrar Novo Cliente
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarCliente} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={novoCliente.nomeCompleto}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, nomeCompleto: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={novoCliente.email}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, email: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="joao@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  WhatsApp / Telefone
                </label>
                <input
                  type="text"
                  required
                  value={novoCliente.whatsapp}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, whatsapp: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                  placeholder="+55 11 98888-7777"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  CPF / CNPJ
                </label>
                <input
                  type="text"
                  value={novoCliente.cpfCnpj}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, cpfCnpj: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-lg shadow-primary/25"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
