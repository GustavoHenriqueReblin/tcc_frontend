import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupplierForm, defaultSupplierFormValues } from "./SupplierForm";
import { type SupplierFormValues } from "@/schemas/supplier.schema";
import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { Supplier } from "@/types/supplier";
import type { ApiResponse } from "@/types/global";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";

export function CreateSupplier() {
    usePageTitle("Cadastro de fornecedor - ERP Industrial");
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const mutation = useMutation<Supplier, Error, SupplierFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const response = await api.post<ApiResponse<Supplier>>("/suppliers", {
                    type: values.type,
                    status: values.status,
                    contactName: values.contactName,
                    contactPhone: values.contactPhone,
                    contactEmail: values.contactEmail,
                    website: values.website,
                    paymentTerms: values.paymentTerms,
                    deliveryTime: values.deliveryTime,
                    category: values.category,
                    notes: values.notes,

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

                        countryId: values.person.countryId || null,
                        stateId: values.person.stateId || null,
                        cityId: values.person.cityId || null,
                    },
                });

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar fornecedor");
                }

                toast.success("Fornecedor cadastrado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao cadastrar o fornecedor.", { id: toastId });
                throw buildApiError(error, "Erro ao cadastrar fornecedor");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/suppliers"],
                exact: false,
            });

            navigate("/suppliers");
        },
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar fornecedor</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar um novo fornecedor.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <SupplierForm
                defaultValues={defaultSupplierFormValues}
                submitLabel="Salvar fornecedor"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/suppliers")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
