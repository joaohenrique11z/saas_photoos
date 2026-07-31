'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [slug, setSlug] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha, slug }),
      });

      if (res.accessToken) {
        localStorage.setItem('photoos_access_token', res.accessToken);
        document.cookie = `photoos_access_token=${res.accessToken}; path=/; max-age=86400`;
        window.location.href = '/';
      }
    } catch (err: any) {
      setErro(err.message || 'Falha ao realizar login no estúdio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card/75 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Entrar no Estúdio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            PhotoOS — Gestão para Fotógrafos
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
              Slug do Estúdio
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex: lumiere-studio"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@studio.com"
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
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-2"
          >
            {loading ? 'Autenticando...' : 'Acessar Estúdio'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta no PhotoOS?{' '}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Criar Estúdio
          </Link>
        </div>
      </div>
    </div>
  );
}
