import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado.",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("rounded-md border bg-card overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow key={row.id || idx} className="hover:bg-muted/30">
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : (row as Record<string, any>)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
