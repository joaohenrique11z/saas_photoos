import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AppointmentStatus =
  | "ORCAMENTO"
  | "AGENDADO"
  | "REALIZADO"
  | "ENTREGUE"
  | "CANCELADO";

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  ORCAMENTO: {
    label: "Orçamento",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300",
  },
  AGENDADO: {
    label: "Agendado",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300",
  },
  REALIZADO: {
    label: "Realizado",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300",
  },
  ENTREGUE: {
    label: "Entregue",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300",
  },
  CANCELADO: {
    label: "Cancelado",
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium px-2 py-0.5 border", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
