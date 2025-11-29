import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerForm } from "./CustomerForm";
import { defaultCustomerFormValues } from "./CustomerForm";
import { type CustomerFormValues } from "@/schemas/customer.schema";
import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { Customer } from "@/types/customer";
import type { ApiResponse } from "@/types/global";
import { buildApiError } from "@/lib/utils";
import { toast } from "sonner";

export function CreateCustomer() {
    usePageTitle("Cadastro de cliente - ERP Industrial");
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const mutation = useMutation<Customer, Error, CustomerFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const response = await api.post<ApiResponse<Customer>>("/customers", {
                    type: values.type,
                    status: values.status,
                    contactName: values.contactName,
                    contactPhone: values.contactPhone,
                    contactEmail: values.contactEmail,

                    person: {
                        name: values.person.name,
                        legalName: values.person.legalName || null,
                        taxId: values.person.taxId,
                        nationalId: values.person.nationalId || null,
                        email: values.person.email,
                        phone: values.person.phone,
                        cellphone: values.person.cellphone || null,
                        maritalStatus: values.person.maritalStatus ?? null,
                        neighborhood: values.person.neighborhood,
                        street: values.person.street,
                        number: values.person.number,
                        complement: values.person.complement || null,
                        postalCode: values.person.postalCode,
                        notes: values.person.notes || null,
                        dateOfBirth: values.person.dateOfBirth || null,

                        countryId: values.person.countryId,
                        stateId: values.person.stateId,
                        cityId: values.person.cityId,
                    },
                });

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar cliente");
                }

                toast.success("Cliente cadastrado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao cadastrar o cliente.", { id: toastId });
                throw buildApiError(error, "Erro ao cadastrar cliente");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/customer"],
                exact: false,
            });

            navigate("/customers");
        },
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar cliente</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar um novo cliente.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <CustomerForm
                defaultValues={defaultCustomerFormValues}
                submitLabel="Salvar cliente"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/customers")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
