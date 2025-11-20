import { usePageTitle } from "@/hooks/usePageTitle";

export function Customers() {
    usePageTitle("Clientes - ERP Industrial");

    return (
        <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
            Clientes
        </div>
    );
}
