'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';

export default function RegisterPage() {
  const [nomeEstudio, setNomeEstudio] = useState('');
  const [slug, setSlug] = useState('');
  const [nomeAdmin, setNomeAdmin] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/register-tenant', {
        method: 'POST',
        body: JSON.stringify({
          nomeEstudio,
          slug,
          adminNome: nomeAdmin,
          adminEmail: emailAdmin,
          adminSenha: senhaAdmin,
        }),
      });

      if (res.accessToken) {
        localStorage.setItem('photoos_access_token', res.accessToken);
        document.cookie = `photoos_access_token=${res.accessToken}; path=/; max-age=86400`;
        window.location.href = '/';
      }
    } catch (err: any) {
      setErro(err.message || 'Falha ao registrar novo estúdio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card/75 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Criar Novo Estúdio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Onboarding e Isolamento Multitenant
          </p>
        </div>

        {erro && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Nome do Estúdio
            </label>
            <input
              type="text"
              required
              value={nomeEstudio}
              onChange={(e) => {
                setNomeEstudio(e.target.value);
                if (!slug) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '-')
                      .replace(/-+/g, '-'),
                  );
                }
              }}
              placeholder="Ex: Lumiere Studio"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Slug do Estúdio (identificador único)
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="lumiere-studio"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Nome do Administrador
            </label>
            <input
              type="text"
              required
              value={nomeAdmin}
              onChange={(e) => setNomeAdmin(e.target.value)}
              placeholder="Seu Nome Completo"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              E-mail do Administrador
            </label>
            <input
              type="email"
              required
              value={emailAdmin}
              onChange={(e) => setEmailAdmin(e.target.value)}
              placeholder="admin@lumiere.com"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              value={senhaAdmin}
              onChange={(e) => setSenhaAdmin(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-2"
          >
            {loading ? 'Criando Estúdio...' : 'Começar a Usar (Trial Gratuito)'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Já possui um estúdio cadastrado?{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Acessar Estúdio
          </Link>
        </div>
      </div>
    </div>
  );
}
