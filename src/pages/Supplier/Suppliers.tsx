import { usePageTitle } from "@/hooks/usePageTitle";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Supplier } from "@/types/supplier";
import { useNavigate } from "react-router-dom";

export function Suppliers() {
    usePageTitle("Fornecedores - ERP Industrial");
    const navigate = useNavigate();

    const columns: ColumnDef<Supplier>[] = [
        {
            accessorKey: "person.name",
            id: "person.name",
            header: "Nome",
            meta: { sortable: true },
        },

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

    const handleRowClick = (row: Supplier) => {
        navigate(`/suppliers/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Fornecedores</h2>
            </div>

            <DataTable<Supplier>
                columns={columns}
                endpoint="/suppliers"
                createButtonDescription="Novo fornecedor"
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
