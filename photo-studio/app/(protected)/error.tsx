"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Algo deu errado!</h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado ao tentar carregar esta tela.
        </p>
      </div>
      <Button variant="outline" onClick={() => reset()}>
        Tentar Novamente
      </Button>
    </div>
  );
}
