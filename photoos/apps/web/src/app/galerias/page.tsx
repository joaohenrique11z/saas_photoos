'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { fetchApi } from '../../lib/api';
import {
  Image as ImageIcon,
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
  Upload,
  ExternalLink,
  X,
} from 'lucide-react';

export default function GaleriasPage() {
  const [galerias, setGalerias] = useState<any[]>([]);
  const [ensaios, setEnsaios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // New Gallery modal
  const [showModal, setShowModal] = useState(false);
  const [novaGaleria, setNovaGaleria] = useState({
    ensaioId: '',
    limiteSelecao: 20,
  });

  // Add Photo modal
  const [galeriaParaFoto, setGaleriaParaFoto] = useState<any | null>(null);
  const [urlOriginal, setUrlOriginal] = useState('');
  const [urlBaixaRes, setUrlBaixaRes] = useState('');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [galeriasData, ensaiosData] = await Promise.all([
        fetchApi('/galeria'),
        fetchApi('/ensaios'),
      ]);
      setGalerias(Array.isArray(galeriasData) ? galeriasData : []);
      setEnsaios(Array.isArray(ensaiosData) ? ensaiosData : []);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar galerias de provas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriarGaleria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/galeria', {
        method: 'POST',
        body: JSON.stringify({
          ensaioId: novaGaleria.ensaioId,
          limiteSelecao: Number(novaGaleria.limiteSelecao),
        }),
      });
      setShowModal(false);
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar galeria do cliente.');
    }
  };

  const handleAdicionarFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galeriaParaFoto) return;
    try {
      await fetchApi(`/galeria/${galeriaParaFoto.id}/foto`, {
        method: 'POST',
        body: JSON.stringify({
          urlOriginal,
          urlBaixaRes: urlBaixaRes || urlOriginal,
          ordem: (galeriaParaFoto.fotos?.length || 0) + 1,
        }),
      });
      setGaleriaParaFoto(null);
      setUrlOriginal('');
      setUrlBaixaRes('');
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar foto à galeria.');
    }
  };

  const copiarLink = (link: string, id: string) => {
    const fullUrl = `http://localhost:3002/g/${link}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  return (
    <DashboardLayout
      title="Galerias de Seleção (Proofing)"
      subtitle="Compartilhamento seguro com link público, marca d'água e cobrança automática de fotos extras (upsell)"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Galeria</span>
        </button>
      }
    >
      {loading ? (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Carregando galerias do estúdio...
        </div>
      ) : erro ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {erro}
        </div>
      ) : galerias.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h4 className="font-semibold text-foreground">
            Nenhuma galeria criada
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Crie uma galeria para permitir que seu cliente escolha as fotos do ensaio online.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galerias.map((g) => (
            <div
              key={g.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${
                      g.finalizada
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    {g.finalizada ? 'SELEÇÃO FINALIZADA' : 'EM PROOFING'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Limite: {g.limiteSelecao} fotos
                  </span>
                </div>

                <h3 className="font-semibold text-base text-foreground mt-2">
                  {g.ensaio?.servico?.nome || 'Ensaio Fotográfico'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cliente: {g.ensaio?.cliente?.nomeCompleto}
                </p>

                <div className="mt-4 flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <span>Fotos na galeria:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {g.fotos?.length || 0} fotos
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setGaleriaParaFoto(g)}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Adicionar Foto</span>
                </button>

                <button
                  onClick={() => copiarLink(g.linkPublico, g.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-mono text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {copiadoId === g.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">
                        Copiado!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Link Portal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Foto */}
      {galeriaParaFoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground">
                Adicionar Foto à Galeria
              </h3>
              <button
                onClick={() => setGaleriaParaFoto(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdicionarFoto} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  URL da Foto Original (Alta Resolução)
                </label>
                <input
                  type="url"
                  required
                  value={urlOriginal}
                  onChange={(e) => setUrlOriginal(e.target.value)}
                  placeholder="https://s3.amazonaws.com/photoos/foto123.jpg"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  URL da Foto Baixa Resolução (Com Marca D'água)
                </label>
                <input
                  type="url"
                  value={urlBaixaRes}
                  onChange={(e) => setUrlBaixaRes(e.target.value)}
                  placeholder="https://s3.amazonaws.com/photoos/foto123_watermarked.jpg"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setGaleriaParaFoto(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-lg shadow-primary/25"
                >
                  Adicionar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Galeria */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground">
                Criar Nova Galeria
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarGaleria} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Ensaio do Estúdio
                </label>
                <select
                  required
                  value={novaGaleria.ensaioId}
                  onChange={(e) =>
                    setNovaGaleria({ ...novaGaleria, ensaioId: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Selecione um ensaio...</option>
                  {ensaios.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.servico?.nome} — Cliente: {e.cliente?.nomeCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Limite de Seleção Inclusa (Fotos extras geram cobrança automática)
                </label>
                <input
                  type="number"
                  required
                  value={novaGaleria.limiteSelecao}
                  onChange={(e) =>
                    setNovaGaleria({
                      ...novaGaleria,
                      limiteSelecao: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
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
                  Criar Galeria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
