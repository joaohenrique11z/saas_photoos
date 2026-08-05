"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight } from "lucide-react";
import Image from "next/image";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50/50 to-stone-100 p-4">
      <Card className="w-full max-w-md border-border/40 bg-white/95 text-foreground shadow-md backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4 text-center pb-6 pt-10">
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden shrink-0 shadow-sm border-4 border-white ring-1 ring-border/20">
            <Image 
              src="/logo.png" 
              alt="Taella Photos Logo" 
              width={80} 
              height={80} 
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Taella Photos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Ferramenta Pessoal de Gestão Fotográfica
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Usuário do Estúdio
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-pink-500 rounded-xl"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha de Acesso
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-pink-500 rounded-xl"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70 transition-all duration-200"
            >
              <span>{loading ? "Entrando..." : "Acessar Estúdio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Gestão simplificada e inteligente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
