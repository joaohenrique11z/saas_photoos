'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { fetchApi } from '../../lib/api';
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  ShieldCheck,
  Eye,
  X,
  Copy,
} from 'lucide-react';

export default function ContratosPage() {
  const [modelos, setModelos] = useState<any[]>([]);
  const [ensaios, setEnsaios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // View Contract modal
  const [contratoVisualizado, setContratoVisualizado] = useState<any | null>(null);

  // New Template modal
  const [showModal, setShowModal] = useState(false);
  const [novoModelo, setNovoModelo] = useState({
    nome: '',
    conteudo:
      'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS\n\nESTÚDIO: {{TENANT_NOME}}\nCLIENTE: {{CLIENTE_NOME}} (CPF/CNPJ: {{CLIENTE_CPF_CNPJ}})\nSERVIÇO: {{SERVICO_NOME}}\nDATA DO ENSAIO: {{ENSAIO_DATA}}\nVALOR DO SERVIÇO: R$ {{ENSAIO_VALOR}}\n\nPor meio deste instrumento, as partes concordam com os termos e condições...',
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [modelosData, ensaiosData] = await Promise.all([
        fetchApi('/contratos/modelos'),
        fetchApi('/ensaios'),
      ]);
      setModelos(Array.isArray(modelosData) ? modelosData : []);
      setEnsaios(Array.isArray(ensaiosData) ? ensaiosData : []);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar modelos e contratos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriarModelo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/contratos/modelos', {
        method: 'POST',
        body: JSON.stringify({
          nome: novoModelo.nome,
          conteudoHtml: novoModelo.conteudo,
        }),
      });
      setShowModal(false);
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar modelo de contrato.');
    }
  };

  const handleGerarOuVerContrato = async (ensaio: any) => {
    try {
      const res = await fetchApi(`/contratos/ensaio/${ensaio.id}`);
      setContratoVisualizado(res);
    } catch {
      // If contract does not exist, generate using the first model
      if (modelos.length === 0) {
        alert('Crie pelo menos 1 modelo de contrato antes de gerar.');
        return;
      }
      try {
        const generated = await fetchApi('/contratos/gerar', {
          method: 'POST',
          body: JSON.stringify({
            ensaioId: ensaio.id,
            modeloId: modelos[0].id,
          }),
        });
        setContratoVisualizado(generated);
      } catch (err: any) {
        alert(err.message || 'Erro ao gerar contrato.');
      }
    }
  };

  return (
    <DashboardLayout
      title="Contratos Digitais"
      subtitle="Renderização de templates dinâmicos com assinatura criptográfica SHA-256, hash IP e carimbo de data/hora"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Modelo</span>
        </button>
      }
    >
      {/* Modelos / Templates */}
      <div className="mb-10">
        <h3 className="font-semibold text-base mb-4 text-foreground">
          Modelos de Contrato e Placeholders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelos.map((m) => (
            <div
              key={m.id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Template
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(m.atualizadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground">{m.nome}</h4>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 font-mono bg-muted/30 p-2.5 rounded-lg border border-border/40">
                  {m.conteudo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Contratos por Ensaio */}
      <div>
        <h3 className="font-semibold text-base mb-4 text-foreground">
          Contratos Emitidos por Ensaio
        </h3>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            Carregando lista de contratos...
          </div>
        ) : ensaios.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h4 className="font-semibold text-foreground">
              Nenhum ensaio disponível
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Os contratos são vinculados aos ensaios agendados pelo estúdio.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Ensaio / Serviço
                  </th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Data do Ensaio
                  </th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Ações & Assinatura
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ensaios.map((ensaio) => (
                  <tr
                    key={ensaio.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {ensaio.servico?.nome || 'Serviço de Fotografia'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {ensaio.cliente?.nomeCompleto}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {new Date(ensaio.dataHora).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleGerarOuVerContrato(ensaio)}
                        className="inline-flex items-center space-x-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver / Gerar Contrato</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Visualização Contrato e Assinatura SHA-256 */}
      {contratoVisualizado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Documento Contratual Renderizado
                </h3>
                <span className="text-xs text-muted-foreground">
                  Ensaio ID: {contratoVisualizado.ensaioId}
                </span>
              </div>
              <button
                onClick={() => setContratoVisualizado(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signature Hash Badge */}
            <div className="mb-4 p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    contratoVisualizado.assinado
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                />
                <div>
                  <span className="text-xs font-semibold block text-foreground">
                    Status:{' '}
                    {contratoVisualizado.assinado
                      ? 'ASSINADO DIGITALMENTE'
                      : 'AGUARDANDO ASSINATURA DO CLIENTE'}
                  </span>
                  {contratoVisualizado.hashAssinatura && (
                    <span className="text-[10px] font-mono text-muted-foreground block truncate max-w-sm">
                      SHA-256: {contratoVisualizado.hashAssinatura}
                    </span>
                  )}
                </div>
              </div>

              {contratoVisualizado.assinadoEm && (
                <span className="text-xs font-mono text-muted-foreground">
                  {new Date(contratoVisualizado.assinadoEm).toLocaleString('pt-BR')}
                </span>
              )}
            </div>

            <div className="flex-1 bg-muted/30 border border-border rounded-xl p-4 font-mono text-xs whitespace-pre-wrap text-foreground overflow-y-auto max-h-96">
              {contratoVisualizado.conteudoFinal}
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Modelo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-foreground">
                Criar Modelo de Contrato
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarModelo} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Nome do Modelo
                </label>
                <input
                  type="text"
                  required
                  value={novoModelo.nome}
                  onChange={(e) =>
                    setNovoModelo({ ...novoModelo, nome: e.target.value })
                  }
                  placeholder="Ex: Contrato Padrão de Casamento"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Conteúdo e Placeholders (Suporta{' '}
                  <code className="text-primary font-mono">
                    {'{{CLIENTE_NOME}}'}
                  </code>
                  ,{' '}
                  <code className="text-primary font-mono">
                    {'{{SERVICO_NOME}}'}
                  </code>
                  , etc.)
                </label>
                <textarea
                  rows={8}
                  required
                  value={novoModelo.conteudo}
                  onChange={(e) =>
                    setNovoModelo({ ...novoModelo, conteudo: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded-lg p-3 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
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
                  Salvar Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
