import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/customer";
import { StatusEnum } from "@/types/enums";
import { usePageTitle } from "@/hooks/usePageTitle";

export function Customers() {
    usePageTitle("Clientes - ERP Industrial");

    const columns: ColumnDef<Customer>[] = [
        { accessorKey: "person.name", id: "person.name", header: "Nome", meta: { sortable: true } },
        {
            accessorKey: "person.phone",
            id: "person.phone",
            header: "Telefone",
            meta: { sortable: false },
        },
        {
            accessorKey: "person.email",
            id: "person.email",
            header: "E-mail",
            meta: { sortable: false },
        },
        {
            accessorKey: "person.city.name",
            id: "person.city.name",
            header: "Cidade",
            meta: { sortable: false },
        },
        {
            accessorKey: "person.state.uf",
            id: "person.state.uf",
            header: "UF",
            meta: { sortable: false },
        },
        {
            accessorKey: "status",
            id: "status",
            header: "Status",
            meta: { sortable: false },
            cell: ({ row }) =>
                row.original.status === StatusEnum.ACTIVE ? (
                    <span className="text-green-500">Ativo</span>
                ) : (
                    <span className="text-red-500">Inativo</span>
                ),
        },
    ];

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Clientes</h2>

            <DataTable<Customer>
                columns={columns}
                endpoint="/customers"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                mobileFields={[
                    { label: "Nome", value: "person.name" },
                    { label: "Telefone", value: "person.phone" },
                    { label: "Cidade", value: "person.city.name" },
                    { label: "UF", value: "person.state.uf" },
                ]}
            />
        </div>
    );
}
