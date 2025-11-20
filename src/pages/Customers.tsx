import { api } from "@/api/client";
import { DataTable } from "@/components/ui/data-table";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types/customer";
import { PersonTypeEnum, StatusEnum } from "@/types/enums";
import { ApiResponse } from "@/types/global";

export function Customers() {
    usePageTitle("Clientes - ERP Industrial");

    const { data: customerData, isLoading } = useQuery<
        ApiResponse<{
            customers: Customer[];
            meta: {
                total: number;
                page: number;
                totalPages: number;
            };
        }>
    >({
        queryKey: ["customers"],
        queryFn: async () => {
            const response = await api.get<
                ApiResponse<{
                    customers: Customer[];
                    meta: {
                        total: number;
                        page: number;
                        totalPages: number;
                    };
                }>
            >("/customers");

            return response.data;
        },
    });

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: "person.name",
            header: "Nome",
            cell: ({ row }) => row.original.person?.name,
        },
        {
            accessorKey: "person.phone",
            header: "Telefone",
            cell: ({ row }) => row.original.person?.phone ?? row.original.contactPhone,
        },
        {
            accessorKey: "person.email",
            header: "E-mail",
            cell: ({ row }) => row.original.person?.email ?? row.original.contactEmail,
        },
        {
            accessorKey: "person.cityId",
            header: "Cidade",
            cell: ({ row }) => row.original.person.city?.name,
        },
        {
            accessorKey: "person.stateId",
            header: "Estado",
            cell: ({ row }) => row.original.person.state?.uf,
        },
        {
            accessorKey: "person.postalCode",
            header: "CEP",
            cell: ({ row }) => row.original.person?.postalCode,
        },
        {
            accessorKey: "person.dateOfBirth",
            header: "Nascimento",
            cell: ({ row }) => {
                const dob = row.original.person?.dateOfBirth;
                if (!dob) return "";

                return new Date(dob).toLocaleDateString("pt-BR");
            },
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => {
                const type = row.original.type;
                return type === PersonTypeEnum.INDIVIDUAL ? "Pessoa Física" : "Pessoa Jurídica";
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;

                const classes =
                    status === StatusEnum.ACTIVE
                        ? "text-green-500 font-medium"
                        : "text-red-500 font-medium";

                return (
                    <span className={classes}>
                        {status === StatusEnum.ACTIVE ? "Ativo" : "Inativo"}
                    </span>
                );
            },
        },
    ];

    const data = customerData?.data.customers ?? [];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Clientes</h2>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                searchable
                mobileFields={[
                    { label: "Nome", value: "person.name" },
                    { label: "Telefone", value: "person.phone" },
                    { label: "Cidade", value: "person.city.name" },
                    {
                        label: "Status",
                        value: "status",
                        render: (value) => (value === StatusEnum.ACTIVE ? "Ativo" : "Inativo"),
                    },
                ]}
            />
        </div>
    );
}
