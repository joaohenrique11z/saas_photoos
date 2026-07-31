'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Eye,
  Check,
  Lock,
  Send,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function GaleriaPublicaPage() {
  const params = useParams();
  const token = params?.token as string;

  const [galeria, setGaleria] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function carregarGaleria() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/galeria/portal/${token}`);
        if (!res.ok) {
          throw new Error('Galeria não encontrada ou link expirado.');
        }
        const data = await res.json();
        setGaleria(data);

        // Pre-fill already selected photos
        const initial: Record<string, boolean> = {};
        if (Array.isArray(data.fotos)) {
          data.fotos.forEach((foto: any) => {
            if (foto.selecionada) {
              initial[foto.id] = true;
            }
          });
        }
        setSelecionados(initial);
      } catch (err: any) {
        setErro(err.message || 'Falha ao carregar galeria de fotos.');
      } finally {
        setLoading(false);
      }
    }

    carregarGaleria();
  }, [token]);

  const toggleFoto = (fotoId: string) => {
    if (galeria?.finalizada) return;
    setSelecionados((prev) => ({
      ...prev,
      [fotoId]: !prev[fotoId],
    }));
  };

  const handleFinalizarSelecao = async () => {
    if (!galeria) return;
    const ids = Object.keys(selecionados).filter((id) => selecionados[id]);
    if (ids.length === 0) {
      alert('Selecione pelo menos 1 foto antes de finalizar.');
      return;
    }

    if (
      !confirm(
        `Confirmar a seleção de ${ids.length} fotos e enviar para edição final?`,
      )
    ) {
      return;
    }

    setEnviando(true);
    try {
      const selecoesPayload = Object.keys(selecionados).map((fotoId) => ({
        fotoId,
        selecionada: Boolean(selecionados[fotoId]),
      }));

      const res = await fetch(`${API_URL}/galeria/portal/${token}/selecionar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selecoes: selecoesPayload }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro ao salvar seleção.');
      }

      setSucesso(true);
      setGaleria({ ...galeria, finalizada: true });
    } catch (err: any) {
      alert(err.message || 'Falha ao finalizar seleção.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-muted-foreground animate-pulse">
        Carregando galeria de provas fotográficas...
      </div>
    );
  }

  if (erro || !galeria) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">
            Acesso Indisponível
          </h2>
          <p className="text-sm text-muted-foreground mt-2">{erro}</p>
        </div>
      </div>
    );
  }

  const totalSelecionadas = Object.values(selecionados).filter(Boolean).length;
  const limite = galeria.limiteSelecao || 0;
  const extras = Math.max(0, totalSelecionadas - limite);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Studio info */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-foreground">
                {galeria.ensaio?.servico?.nome || 'Galeria de Provas'}
              </h1>
              <span className="text-xs text-muted-foreground">
                Para:{' '}
                <strong className="text-foreground">
                  {galeria.ensaio?.cliente?.nomeCompleto}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {galeria.finalizada ? (
              <span className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <Lock className="w-3.5 h-3.5" />
                <span>SELEÇÃO FINALIZADA</span>
              </span>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">
                Clique nas fotos abaixo para selecionar
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {sucesso && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-4">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">
                Seleção Enviada com Sucesso!
              </h3>
              <p className="text-sm text-emerald-300/80 mt-1">
                Suas {totalSelecionadas} foto(s) escolhidas foram enviadas ao estúdio para edição final e aprovação.
              </p>
            </div>
          </div>
        )}

        {/* Gallery masonry/grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(galeria.fotos || []).map((foto: any, index: number) => {
            const isSelected = !!selecionados[foto.id];

            return (
              <div
                key={foto.id}
                onClick={() => toggleFoto(foto.id)}
                className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 select-none ${
                  isSelected
                    ? 'border-primary shadow-xl shadow-primary/25 scale-[0.98]'
                    : 'border-border bg-card hover:border-muted-foreground/40'
                }`}
              >
                {/* Watermarked photo display using URL or simulated placeholder gradient */}
                {foto.urlBaixaRes || foto.urlOriginal ? (
                  <img
                    src={foto.urlBaixaRes || foto.urlOriginal}
                    alt={`Prova ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-card flex flex-col items-center justify-center text-muted-foreground">
                    <Eye className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-mono">
                      FOTO #{foto.ordem || index + 1}
                    </span>
                  </div>
                )}

                {/* Selection indicator checkmark */}
                <div
                  className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-background/60 backdrop-blur-sm text-muted-foreground border border-border group-hover:border-foreground'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                  />
                </div>

                {/* Watermark overlay text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 transform -rotate-12">
                  <span className="text-xl font-bold uppercase tracking-widest text-white drop-shadow-md">
                    PROVA PHOTOOS
                  </span>
                </div>

                {/* Photo number tag */}
                <div className="absolute bottom-2 left-3 text-[10px] font-mono uppercase bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded text-foreground">
                  #{foto.ordem || index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar for Selection Control & Upsell */}
      {!galeria.finalizada && (
        <footer className="fixed bottom-0 inset-x-0 bg-card/90 backdrop-blur-xl border-t border-border p-4 z-40 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Selecionadas:</span>{' '}
                <strong className="text-foreground font-mono text-base">
                  {totalSelecionadas}
                </strong>{' '}
                <span className="text-muted-foreground">
                  de {limite} (inclusas no pacote)
                </span>
              </div>

              {extras > 0 && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    +{extras} foto(s) extra(s) • Sujeito a cobrança adicional
                  </span>
                </span>
              )}
            </div>

            <button
              onClick={handleFinalizarSelecao}
              disabled={enviando || totalSelecionadas === 0}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {enviando
                  ? 'Enviando Seleção...'
                  : 'Finalizar & Enviar Seleção ao Estúdio'}
              </span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
