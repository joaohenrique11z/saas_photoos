import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PhotoOS — Gestão de Estúdios Fotográficos',
  description:
    'SaaS multitenant completo com CRM, Agenda, Finanças, Contratos e Galeria de Provas para Estúdios de Fotografia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        {children}
      </body>
    </html>
  );
}
