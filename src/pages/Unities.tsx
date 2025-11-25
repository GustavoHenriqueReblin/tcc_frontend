import { usePageTitle } from "@/hooks/usePageTitle";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Unity } from "@/types/unity";

export function Unities() {
    usePageTitle("Unidades de Medida - ERP Industrial");

    const columns: ColumnDef<Unity>[] = [
        {
            accessorKey: "simbol",
            id: "simbol",
            header: "Símbolo",
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
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
        },
    ];

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Unidades de Medida</h2>

            <DataTable<Unity>
                columns={columns}
                endpoint="/unities"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                mobileFields={[
                    { label: "Símbolo", value: "simbol" },
                    { label: "Descrição", value: "description" },
                ]}
            />
        </div>
    );
}
