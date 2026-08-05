import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-border/40 bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-border group",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2.5">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground transition-transform duration-200 group-hover:scale-110">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-xs",
                  trend.positive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
