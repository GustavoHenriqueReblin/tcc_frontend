export function Loading() {
    return (
        <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground animate-pulse">
            <div className="h-4 w-4 rounded-full border-[3px] border-border border-t-transparent animate-spin" />
            <span className="tracking-wide">Carregando…</span>
        </div>
    );
}
