export function Loading() {
    return (
        <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Carregando...
        </div>
    );
}
