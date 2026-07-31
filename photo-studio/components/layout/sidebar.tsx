"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Camera,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Atendimentos", href: "/atendimentos", icon: Calendar },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-xl flex flex-col justify-between p-4 h-screen sticky top-0 shrink-0">
      <div>
        {/* Studio Branding */}
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-foreground">
              Photo Studio
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              Solo Pro
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-border mt-auto">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
