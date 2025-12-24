import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ProductDefinition } from "@/types/productDefinition";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { productDefinitionTypeLabels } from "@/types/global";

export function ProductDefinitions() {
    usePageTitle("Definições de Produto - ERP Industrial");
    const navigate = useNavigate();

    const columns: ColumnDef<ProductDefinition>[] = [
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
            accessorKey: "type",
            id: "type",
            header: "Tipo",
            meta: { sortable: true },
            cell: ({ row }) =>
                productDefinitionTypeLabels[
                    row.original.type as keyof typeof productDefinitionTypeLabels
                ] ?? "",
        },
        {
            accessorKey: "createdAt",
            id: "createdAt",
            header: "Criado em",
            meta: { sortable: true },
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
        },
    ];

    const handleRowClick = (row: ProductDefinition) => {
        navigate(`/product-definitions/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Definições de Produto</h2>
            </div>

            <DataTable<ProductDefinition>
                columns={columns}
                endpoint="/product-definitions"
                createButtonDescription="Nova definição"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Nome", value: "name" },
                    {
                        label: "Tipo",
                        value: "type",
                        render: (value, row) =>
                            productDefinitionTypeLabels[
                                row.type as keyof typeof productDefinitionTypeLabels
                            ] ?? value,
                    },
                    { label: "Descrição", value: "description" },
                ]}
            />
        </div>
    );
}
