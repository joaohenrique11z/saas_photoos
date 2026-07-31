"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Lock, User, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("fotografa");
  const [password, setPassword] = useState("defina-uma-senha-forte-aqui");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciais inválidas.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao entrar no sistema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Photo Studio
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ferramenta Pessoal de Gestão Fotográfica
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Usuário do Estúdio
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Senha de Acesso
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all duration-150"
            >
              <span>{loading ? "Entrando..." : "Acessar Estúdio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500">
              Usuário único • Sem multitenant • 100% focado no seu dia a dia
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
