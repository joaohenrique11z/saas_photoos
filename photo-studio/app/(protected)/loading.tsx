export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Carregando dados...</p>
      </div>
    </div>
  );
}
