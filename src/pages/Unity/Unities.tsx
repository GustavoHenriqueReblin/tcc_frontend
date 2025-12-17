import { usePageTitle } from "@/hooks/usePageTitle";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Unity } from "@/types/unity";
import { useNavigate } from "react-router-dom";

export function Unities() {
    usePageTitle("Unidades de Medida - ERP Industrial");
    const navigate = useNavigate();

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

    const handleRowClick = (row: Unity) => {
        navigate(`/unities/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Unidades de Medida</h2>
            </div>

            <DataTable<Unity>
                columns={columns}
                endpoint="/unities"
                createButtonDescription="Nova unidade"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Símbolo", value: "simbol" },
                    { label: "Descrição", value: "description" },
                ]}
            />
        </div>
    );
}
