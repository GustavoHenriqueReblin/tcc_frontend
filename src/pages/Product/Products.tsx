import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { ComboboxStandalone } from "@/components/ComboboxStandalone";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatCurrency, formatNumber } from "@/utils/global";
import { ProductDefinitionType, productDefinitionTypeLabels } from "@/types/global";
import { Product } from "@/types/product";

type ProductFilters = {
    productDefinitionId?: number;
};

export function Products() {
    usePageTitle("Produtos - ERP industrial");
    const navigate = useNavigate();

    const [filters, setFilters] = useState<ProductFilters>({});
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [totalSaleValue, setTotalSaleValue] = useState<number>(0);

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: "Nome",
            meta: { sortable: true },
        },
        {
            accessorKey: "barcode",
            header: "Código de Barras",
            meta: { sortable: true },
        },
        {
            id: "quantity",
            header: "Quantidade",
            accessorKey: "productInventory[0].quantity",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                const unity = row.original.unity?.simbol ?? "";
                return inv ? `${formatNumber(Number(inv.quantity))} ${unity}`.trim() : "-";
            },
        },
        {
            id: "costValue",
            header: "Custo Unit.",
            accessorKey: "productInventory[0].costValue",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv ? `${formatCurrency(Number(inv.costValue))}` : "-";
            },
        },
        {
            id: "saleValue",
            header: "Venda Unit.",
            accessorKey: "productInventory[0].saleValue",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv ? `${formatCurrency(Number(inv.saleValue))}` : "-";
            },
        },
        {
            accessorKey: "productDefinition",
            header: "Definição",
            enableSorting: false,
            meta: { sortable: false },
            cell: ({ row }) => {
                const type = row.original.productDefinition?.type as
                    | ProductDefinitionType
                    | undefined;
                return type ? productDefinitionTypeLabels[type] : "-";
            },
        },
        {
            accessorKey: "createdAt",
            header: "Criado em",
            meta: { sortable: true },
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
        },
    ];

    const handleRowClick = (row: Product) => {
        navigate(`/products/edit/${row.id}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-semibold">Produtos</h2>
            </div>

            <DataTable<Product>
                columns={columns}
                endpoint="/products"
                filters={filters}
                filterComponents={
                    <div className="w-full md:w-64">
                        <ComboboxStandalone<{ id: number; name: string }>
                            label="Definição de produto"
                            endpoint="/product-definitions"
                            valueField="id"
                            labelField="name"
                            value={filters.productDefinitionId ?? null}
                            showError={false}
                            onChange={(val) =>
                                setFilters((prev) => {
                                    const next = { ...prev };
                                    if (val == null) delete next.productDefinitionId;
                                    else next.productDefinitionId = val;
                                    return next;
                                })
                            }
                        />
                    </div>
                }
                createButtonDescription="Novo produto"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Nome", value: "name" },
                    {
                        label: "Tipo",
                        value: "productDefinition.type",
                        render: (value, row) => {
                            const type = row.productDefinition?.type as
                                | ProductDefinitionType
                                | undefined;
                            return type ? productDefinitionTypeLabels[type] : value;
                        },
                    },
                    {
                        label: "Quantidade",
                        value: "productInventory.0.quantity",
                        render: (_value, row) => {
                            const inv = row.productInventory?.[0];
                            const unity = row.unity?.simbol ?? "";
                            return inv
                                ? `${formatNumber(Number(inv.quantity))} ${unity}`.trim()
                                : "-";
                        },
                    },
                    {
                        label: "Custo",
                        value: "productInventory.0.costValue",
                        render: (_value, row) => {
                            const inv = row.productInventory?.[0];
                            return inv ? `${formatCurrency(Number(inv.costValue))}` : "-";
                        },
                    },
                    {
                        label: "Venda",
                        value: "productInventory.0.saleValue",
                        render: (_value, row) => {
                            const inv = row.productInventory?.[0];
                            return inv ? `${formatCurrency(Number(inv.saleValue))}` : "-";
                        },
                    },
                ]}
                onDataResult={(data) => {
                    let qty = 0;
                    let cost = 0;
                    let sale = 0;

                    data.forEach((product) => {
                        const inv = product.productInventory?.[0];
                        if (!inv) return;

                        const q = Number(inv.quantity ?? 0);
                        const c = Number(inv.costValue ?? 0);
                        const s = Number(inv.saleValue ?? 0);

                        qty += q;
                        cost += q * c;
                        sale += q * s;
                    });

                    setTotalQuantity(qty);
                    setTotalCost(cost);
                    setTotalSaleValue(sale);
                }}
            />

            <div className="flex flex-wrap justify-end gap-6 border-t pt-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Quantidade total</span>
                    <span className="font-semibold">{formatNumber(totalQuantity)}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Custo total do estoque</span>
                    <span className="font-semibold">{formatCurrency(totalCost)}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Valor potencial de venda</span>
                    <span className="font-semibold">{formatCurrency(totalSaleValue)}</span>
                </div>
            </div>
        </div>
    );
}
