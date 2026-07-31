'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Camera,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { label: 'Clientes (CRM)', href: '/clientes', icon: Users },
  { label: 'Ensaios & Projetos', href: '/ensaios', icon: Camera },
  { label: 'Agenda & Lembretes', href: '/agenda', icon: Calendar },
  { label: 'Financeiro & Lucro', href: '/financeiro', icon: DollarSign },
  { label: 'Contratos Digitais', href: '/contratos', icon: FileText },
  { label: 'Galerias (Proofing)', href: '/galerias', icon: ImageIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('photoos_access_token');
      document.cookie =
        'photoos_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col justify-between p-4 h-screen sticky top-0">
      <div>
        {/* Studio Branding & Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-foreground">
                PhotoOS
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                Pro Studio
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-border mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair do Estúdio</span>
        </button>
      </div>
    </aside>
  );
}
