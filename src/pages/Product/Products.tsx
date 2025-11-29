import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/product";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

export function Products() {
    usePageTitle("Produtos - ERP Industrial");
    const navigate = useNavigate();

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            id: "name",
            header: "Nome",
            meta: { sortable: true },
        },
        {
            accessorKey: "barcode",
            id: "barcode",
            header: "Codigo de Barras",
            meta: { sortable: true },
        },
        {
            accessorKey: "productInventory",
            id: "quantity",
            header: "Quantidade",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                const unity = row.original.unity?.simbol ?? "";
                return inv ? `${Number(inv.quantity).toLocaleString("pt-BR")} ${unity}`.trim() : "";
            },
        },
        {
            accessorKey: "productInventory",
            id: "costValue",
            header: "Custo",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv
                    ? `R$ ${Number(inv.costValue).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                      })}`
                    : "";
            },
        },
        {
            accessorKey: "productInventory",
            id: "saleValue",
            header: "Venda",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv
                    ? `R$ ${Number(inv.saleValue).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                      })}`
                    : "";
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

    const handleRowClick = (row: Product) => {
        navigate(`/products/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Produtos</h2>
            </div>

            <DataTable<Product>
                columns={columns}
                endpoint="/products"
                createButtonDescription="Novo Produto"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Nome", value: "name" },
                    { label: "Unidade", value: "unity.simbol" },
                    { label: "Quantidade", value: "productInventory.0.quantity" },
                    { label: "Venda", value: "productInventory.0.saleValue" },
                ]}
            />
        </div>
    );
}
