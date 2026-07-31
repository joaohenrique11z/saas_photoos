'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('photoos_access_token');
      if (
        !token &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </header>
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
