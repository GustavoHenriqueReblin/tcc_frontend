import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/product";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Products() {
    usePageTitle("Produtos - ERP Industrial");

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
            header: "Código de Barras",
            meta: { sortable: true },
        },
        {
            accessorKey: "productInventory",
            id: "quantity",
            header: "Quantidade",
            meta: { sortable: true },
            cell: ({ row }) => {
                const inv = row.original.productInventory?.[0];
                return inv ? Number(inv.quantity).toLocaleString("pt-BR") : "-";
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
                    ? String(
                          "R$ " +
                              Number(inv.costValue).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                              })
                      )
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
                    ? String(
                          "R$ " +
                              Number(inv.saleValue).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                              })
                      )
                    : "";
            },
        },
        {
            accessorKey: "unity.simbol",
            id: "unity.simbol",
            header: "Unid.",
            meta: { sortable: false },
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
            <h2 className="text-xl font-semibold">Produtos</h2>

            <DataTable<Product>
                columns={columns}
                endpoint="/products"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
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
