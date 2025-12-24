import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/customer";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

export function Customers() {
    usePageTitle("Clientes - ERP Industrial");
    const navigate = useNavigate();

    const columns: ColumnDef<Customer>[] = [
        { accessorKey: "person.name", id: "person.name", header: "Nome", meta: { sortable: true } },
        {
            accessorKey: "person.phone",
            id: "person.phone",
            header: "Telefone",
            meta: { sortable: false },
        },
        {
            accessorKey: "person.taxId",
            id: "person.taxId",
            header: "CPF/CNPJ",
            meta: { sortable: false },
        },
        {
            accessorKey: "person.city.name",
            id: "person.city.name",
            header: "Cidade",
            meta: { sortable: false },
            cell: ({ row }) => {
                const city = row.original.person.city?.name ?? "";
                const uf = row.original.person.state?.uf ?? "";
                return city ? `${city} - ${uf}` : "";
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

    const handleRowClick = (row: Customer) => {
        navigate(`/customers/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Clientes</h2>
            </div>

            <DataTable<Customer>
                columns={columns}
                endpoint="/customers"
                createButtonDescription="Novo cliente"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={handleRowClick}
                mobileFields={[
                    { label: "Nome", value: "person.name" },
                    { label: "CPF/CNPJ", value: "person.taxId" },
                    {
                        label: "Telefone",
                        value: "person.phone",
                        render: (_value, row) => {
                            const number = row.person.phone || row.person.cellphone;
                            return number;
                        },
                    },
                    {
                        label: "Cidade/UF",
                        value: "person.city.name",
                        render: (_value, row) => {
                            const city = row.person.city?.name ?? "";
                            const uf = row.person.state?.uf ?? "";
                            return city ? `${city} - ${uf}` : "";
                        },
                    },
                ]}
            />
        </div>
    );
}
