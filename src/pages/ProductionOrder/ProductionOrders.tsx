import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import type { ProductionOrder } from "@/types/productionOrder";
import { ProductionOrderStatus, productionOrderStatusLabels } from "@/types/global";
import { usePageTitle } from "@/hooks/usePageTitle";

const productionOrderStatusColors: Record<ProductionOrderStatus, string> = {
    PLANNED: "bg-gray-200 text-gray-800",
    RUNNING: "bg-blue-100 text-blue-800",
    FINISHED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
};

export function ProductionOrders() {
    usePageTitle("Ordens de produção - ERP Industrial");
    const navigate = useNavigate();

    const columns: ColumnDef<ProductionOrder>[] = [
        {
            accessorKey: "code",
            id: "code",
            header: "Código",
            meta: { sortable: true },
        },
        {
            accessorKey: "product.name",
            id: "product.name",
            header: "Produto",
            meta: { sortable: true },
            cell: ({ row }) => row.original.product?.name ?? "",
        },
        {
            accessorKey: "status",
            id: "status",
            header: "Status",
            meta: { sortable: true },
            cell: ({ row }) => {
                const status = row.original.status;

                return (
                    <div
                        className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium w-fit",
                            productionOrderStatusColors[status] ?? "bg-gray-100 text-gray-800",
                        ].join(" ")}
                    >
                        {productionOrderStatusLabels[status] ?? status}
                    </div>
                );
            },
        },

        {
            accessorKey: "plannedQty",
            id: "plannedQty",
            header: "Qtd. planejada",
            meta: { sortable: true },
            cell: ({ row }) =>
                Number(row.original.plannedQty ?? 0).toLocaleString("pt-BR") +
                " " +
                row.original.product.unity.simbol,
        },
        {
            accessorKey: "producedQty",
            id: "producedQty",
            header: "Qtd. produzida",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.producedQty != null
                    ? Number(row.original.producedQty).toLocaleString("pt-BR") +
                      " " +
                      row.original.product.unity.simbol
                    : "",
        },
        {
            accessorKey: "startDate",
            id: "startDate",
            header: "Início",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.startDate
                    ? new Date(row.original.startDate).toLocaleDateString("pt-BR")
                    : "",
        },
        {
            accessorKey: "endDate",
            id: "endDate",
            header: "Fim",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.endDate
                    ? new Date(row.original.endDate).toLocaleDateString("pt-BR")
                    : "",
        },
    ];

    const handleRowClick = (row: ProductionOrder) => {
        navigate(`/production-orders/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Ordens de produção</h2>
            </div>

            <DataTable<ProductionOrder>
                columns={columns}
                endpoint="/production-orders"
                createButtonDescription="Nova ordem de produção"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Código", value: "code" },
                    { label: "Produto", value: "product.name" },
                    {
                        label: "Status",
                        value: "status",
                        render: (v, row) =>
                            productionOrderStatusLabels[(row as ProductionOrder).status] ?? v,
                    },
                ]}
            />
        </div>
    );
}
