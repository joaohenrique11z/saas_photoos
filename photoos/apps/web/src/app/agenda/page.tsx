'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { fetchApi } from '../../lib/api';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Camera,
  RefreshCw,
} from 'lucide-react';

export default function AgendaPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Reagendamento modal
  const [eventoParaReagendar, setEventoParaReagendar] = useState<any | null>(null);
  const [novaDataHora, setNovaDataHora] = useState('');
  const [reagendando, setReagendando] = useState(false);

  const carregarAgenda = async () => {
    try {
      setLoading(true);
      // Fetch upcoming events from Agenda module
      const data = await fetchApi('/agenda/eventos');
      setEventos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar agenda do estúdio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgenda();
  }, []);

  const handleReagendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoParaReagendar || !novaDataHora) return;
    setReagendando(true);

    try {
      // Calls Agenda reagendar endpoint which shifts workflow tasks proportionally!
      await fetchApi(`/agenda/reagendar/${eventoParaReagendar.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ novaDataHora }),
      });
      setEventoParaReagendar(null);
      carregarAgenda();
    } catch (err: any) {
      alert(err.message || 'Falha ao reagendar ensaio.');
    } finally {
      setReagendando(false);
    }
  };

  return (
    <DashboardLayout
      title="Agenda & Calendário"
      subtitle="Cronograma unificado com reagendamento inteligente e deslocamento proporcional de tarefas"
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Carregando agenda do estúdio...
        </div>
      ) : erro ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {erro}
        </div>
      ) : eventos.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h4 className="font-semibold text-foreground">
            Sua agenda está livre
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Nenhum ensaio ou evento agendado para o período selecionado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((ev) => (
            <div
              key={ev.id}
              className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary font-mono">
                  <span className="text-xs uppercase font-semibold">
                    {new Date(ev.dataHora).toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">
                    {new Date(ev.dataHora).getDate()}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>{ev.servico?.nome || 'Ensaio Fotográfico'}</span>
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1.5">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{ev.cliente?.nomeCompleto}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(ev.dataHora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                    {ev.local && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{ev.local}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-muted text-muted-foreground uppercase">
                  {ev.status}
                </span>
                <button
                  onClick={() => {
                    setEventoParaReagendar(ev);
                    setNovaDataHora(
                      new Date(ev.dataHora).toISOString().slice(0, 16),
                    );
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reagendar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reagendamento */}
      {eventoParaReagendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-semibold text-lg text-foreground mb-1">
              Reagendar Ensaio
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ao alterar a data/horário, todas as tarefas do workflow serão deslocadas proporcionalmente no calendário.
            </p>

            <form onSubmit={handleReagendar} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Nova Data e Horário
                </label>
                <input
                  type="datetime-local"
                  required
                  value={novaDataHora}
                  onChange={(e) => setNovaDataHora(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEventoParaReagendar(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reagendando}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {reagendando ? 'Reagendando...' : 'Confirmar Reagendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
