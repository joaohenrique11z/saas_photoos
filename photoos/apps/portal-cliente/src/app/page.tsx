'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HomePortalPage() {
  const [token, setToken] = useState('');
  const router = useRouter();

  const handleAcessar = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      router.push(`/g/${token.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card/80 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/25">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Portal do Cliente
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Acesse sua galeria de provas fotográficas informando o código ou link fornecido pelo estúdio.
        </p>

        <form onSubmit={handleAcessar} className="mt-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Cole seu token de galeria..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary text-center font-mono"
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center space-x-2"
          >
            <span>Acessar Provas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
