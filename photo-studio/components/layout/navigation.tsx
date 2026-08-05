"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Atendimentos", href: "/atendimentos", icon: Calendar },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed z-50 flex border-border bg-background/90 backdrop-blur-md transition-all
        bottom-0 left-0 w-full h-16 border-t flex-row justify-around items-center px-2 pb-safe
        md:top-0 md:bottom-auto md:h-screen md:w-64 md:border-t-0 md:border-r md:flex-col md:justify-between md:px-4 md:py-4 md:bg-sidebar/80 md:backdrop-blur-xl select-none"
    >
      <div className="hidden md:block w-full">
        {/* Studio Branding */}
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border/40">
            <Image 
              src="/logo.png" 
              alt="Taella Photos Logo" 
              width={40} 
              height={40} 
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-base tracking-tight text-foreground">
                Taella Photos
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Gestão & CRM
            </span>
          </div>
        </div>

        {/* Desktop Menu Title */}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-3 mb-2 hidden md:block font-mono">
          Menu Principal
        </span>
      </div>

      {/* Navigation items */}
      <div className="flex flex-row w-full justify-around items-center md:flex-col md:justify-start md:space-y-1 md:mt-0 md:w-full">
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
              aria-label={item.label}
              className={cn(
                "group flex flex-col md:flex-row items-center justify-center md:justify-between px-3 py-2 md:py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-pink-600 md:bg-pink-600 md:text-white md:shadow-md md:shadow-pink-600/25 md:font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                <Icon
                  className={cn(
                    "w-5 h-5 md:w-4 md:h-4 transition-transform duration-200 group-hover:scale-110",
                    isActive
                      ? "text-pink-600 md:text-white fill-pink-600/20 md:fill-transparent"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs md:text-sm font-medium",
                    isActive ? "font-bold md:font-semibold" : ""
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="hidden md:block pt-4 border-t border-border/40 mt-auto w-full space-y-3">
        <div className="px-3 py-2.5 rounded-xl bg-muted/50 border border-border/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-600 font-bold text-xs">
            SP
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-foreground truncate">
              Licença Única
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Administrador Solo
            </p>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
