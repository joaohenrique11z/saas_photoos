import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Página não encontrada</h2>
        <p className="text-sm text-muted-foreground">
          O recurso que você tentou acessar não existe ou foi removido.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline">Voltar para o Início</Button>
      </Link>
    </div>
  );
}
