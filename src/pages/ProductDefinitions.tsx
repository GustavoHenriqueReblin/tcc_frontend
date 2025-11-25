import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ProductDefinition } from "@/types/productDefinition";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ProductDefinitionTypeEnum } from "@/types/enums";

export function ProductDefinitions() {
    usePageTitle("Definições de Produto - ERP Industrial");

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
            cell: ({ row }) => {
                const label = () => {
                    switch (row.original.type) {
                        case ProductDefinitionTypeEnum.RAW_MATERIAL:
                            return "Matéria-prima";

                        case ProductDefinitionTypeEnum.FINISHED_PRODUCT:
                            return "Produto acabado";

                        case ProductDefinitionTypeEnum.RESALE_PRODUCT:
                            return "Produto para revenda";

                        case ProductDefinitionTypeEnum.IN_PROCESS_PRODUCT:
                            return "Produto em processo";

                        case ProductDefinitionTypeEnum.COMPONENT:
                            return "Componente";

                        case ProductDefinitionTypeEnum.CONSUMABLE_MATERIAL:
                            return "Material de consumo";

                        case ProductDefinitionTypeEnum.PACKAGING_MATERIAL:
                            return "Material de embalagem";

                        case ProductDefinitionTypeEnum.BY_PRODUCT:
                            return "Subproduto";

                        case ProductDefinitionTypeEnum.RETURNED_PRODUCT:
                            return "Produto devolvido";

                        default:
                            return "";
                    }
                };

                return label();
            },
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
            <h2 className="text-xl font-semibold">Definições de Produto</h2>

            <DataTable<ProductDefinition>
                columns={columns}
                endpoint="/product-definitions"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                mobileFields={[
                    { label: "Nome", value: "name" },
                    { label: "Descrição", value: "description" },
                    { label: "Tipo", value: "type" },
                ]}
            />
        </div>
    );
}
