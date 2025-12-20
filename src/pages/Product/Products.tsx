import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/product";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { ProductDefinitionType, productDefinitionTypeLabels } from "@/types/global";
import { useState } from "react";
import { formatCurrency, formatCurrencyNumber } from "@/utils/global";

export function Products() {
    usePageTitle("Produtos - ERP Industrial");
    const navigate = useNavigate();

    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [totalSaleValue, setTotalSaleValue] = useState<number>(0);
    const [totalProducts, setTotalProducts] = useState<number>(0);

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
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                const unity = row.original.unity?.simbol ?? "";
                return inv
                    ? `${Number(inv.quantity).toLocaleString("pt-BR")} ${unity}`.trim()
                    : "-";
            },
        },
        {
            id: "costValue",
            header: "Custo Unit.",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv
                    ? `${formatCurrency(Number(inv.costValue))}`
                    : "-";
            },
        },
        {
            id: "saleValue",
            header: "Venda Unit.",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv
                    ? `${formatCurrency(Number(inv.saleValue))}`
                    : "-";
            },
        },
        {
            accessorKey: "productDefinition",
            header: "Tipo",
            meta: { sortable: true },
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
                createButtonDescription="Novo produto"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Nome", value: "name" },
                    { label: "Unidade", value: "unity.simbol" },
                    { label: "Quantidade", value: "productInventory.0.quantity" },
                    { label: "Venda", value: "productInventory.0.saleValue" },
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

                    setTotalProducts(data.length);
                    setTotalQuantity(qty);
                    setTotalCost(cost);
                    setTotalSaleValue(sale);
                }}
            />

            <div className="flex flex-wrap justify-end gap-6 border-t pt-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Produtos</span>
                    <span className="font-semibold">{formatCurrencyNumber(totalProducts)}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Quantidade total</span>
                    <span className="font-semibold">{formatCurrencyNumber(totalQuantity)}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Custo total do estoque</span>
                    <span className="font-semibold">
                        {formatCurrency(totalCost)}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Valor potencial de venda</span>
                    <span className="font-semibold">
                        {formatCurrency(totalSaleValue)}
                    </span>
                </div>
            </div>
        </div>
    );
}
