import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Warehouse } from "@/types/warehouse";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Warehouses() {
    usePageTitle("Depósitos - ERP Industrial");

    const columns: ColumnDef<Warehouse>[] = [
        {
            accessorKey: "code",
            id: "code",
            header: "Código",
            meta: { sortable: true },
        },
        {
            accessorKey: "name",
            id: "name",
            header: "Nome",
            meta: { sortable: true },
        },
        {
            accessorKey: "description",
            id: "description",
            header: "Descrição",
            meta: { sortable: true },
        },
        {
            accessorKey: "createdAt",
            id: "createdAt",
            header: "Criado em",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.createdAt
                    ? new Date(row.original.createdAt).toLocaleDateString("pt-BR")
                    : "",
        },
    ];

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Depósitos</h2>

            <DataTable<Warehouse>
                columns={columns}
                endpoint="/warehouses"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                mobileFields={[
                    { label: "Código", value: "code" },
                    { label: "Nome", value: "name" },
                    { label: "Descrição", value: "description" },
                ]}
            />
        </div>
    );
}
