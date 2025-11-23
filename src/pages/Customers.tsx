import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/customer";
import { StatusEnum } from "@/types/enums";

export function Customers() {
    const columns: ColumnDef<Customer>[] = [
        { accessorKey: "person.name", header: "Nome" },
        { accessorKey: "person.phone", header: "Telefone" },
        { accessorKey: "person.email", header: "E-mail" },
        { accessorKey: "person.city.name", header: "Cidade" },
        { accessorKey: "person.state.uf", header: "UF" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) =>
                row.original.status === StatusEnum.ACTIVE ? (
                    <span className="text-green-500">Ativo</span>
                ) : (
                    <span className="text-red-500">Inativo</span>
                ),
        },
    ];

    return (
        <div className="space-y-4">
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
