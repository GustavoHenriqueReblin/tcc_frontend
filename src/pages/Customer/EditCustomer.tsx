import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CustomerForm, defaultCustomerFormValues } from "./CustomerForm";
import type { CustomerFormValues } from "@/schemas/customer.schema";

import { api } from "@/api/client";
import type { Customer } from "@/types/customer";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

export function EditCustomer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de cliente - ERP Industrial");

    useEffect(() => {
        if (!id) navigate("/customers");
    }, [id, navigate]);

    const {
        data: customer,
        error,
        isLoading,
    } = useQuery<Customer, Error>({
        enabled: Boolean(id),
        queryKey: ["customer", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar cliente");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar cliente");
            }
        },
    });

    const updateMutation = useMutation<Customer, Error, CustomerFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador inválido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteração encontrada.", { id: toastId });
                    return;
                }

                const payload = {
                    type: values.type,
                    status: values.status,
                    contactName: values.contactName,
                    contactPhone: values.contactPhone,
                    contactEmail: values.contactEmail,
                    person: {
                        ...values.person,
                        legalName: values.person.legalName || null,
                        nationalId: values.person.nationalId || null,
                        cellphone: values.person.cellphone || null,
                        complement: values.person.complement || null,
                        notes: values.person.notes || null,
                        dateOfBirth: values.person.dateOfBirth || null,
                    },
                };

                const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar cliente");
                }

                toast.success("Cliente alterado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao atualizar o cliente.", { id: toastId });
                throw buildApiError(error, "Erro ao atualizar cliente");
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

    if (isLoading) {
        return <Loading />;
    }

    const formDefaults: CustomerFormValues = customer
        ? {
              type: customer.type,
              status: customer.status,
              contactName: customer.contactName || "",
              contactPhone: customer.contactPhone || "",
              contactEmail: customer.contactEmail || "",
              person: {
                  name: customer.person.name || "",
                  legalName: customer.person.legalName || "",
                  taxId: customer.person.taxId || "",
                  nationalId: customer.person.nationalId || "",
                  email: customer.person.email || "",
                  phone: customer.person.phone || "",
                  cellphone: customer.person.cellphone || "",
                  maritalStatus:
                      (customer.person
                          .maritalStatus as CustomerFormValues["person"]["maritalStatus"]) ?? null,
                  neighborhood: customer.person.neighborhood || "",
                  street: customer.person.street || "",
                  number: customer.person.number || "",
                  complement: customer.person.complement || "",
                  postalCode: customer.person.postalCode || "",
                  notes: customer.person.notes || "",
                  dateOfBirth: customer.person.dateOfBirth
                      ? customer.person.dateOfBirth.split("T")[0]
                      : "",
                  countryId: customer.person.countryId || null,
                  stateId: customer.person.stateId || null,
                  cityId: customer.person.cityId || null,
              },
          }
        : defaultCustomerFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar cliente</h2>
                <p className="text-sm text-muted-foreground">
                    Atualize os dados do cliente selecionado.
                </p>
            </div>

            {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error?.message}
                </div>
            ) : (
                <>
                    {updateMutation.error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {updateMutation.error?.message}
                        </div>
                    )}
                    <CustomerForm
                        defaultValues={formDefaults}
                        submitLabel="Atualizar cliente"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/customers")}
                        isLoading={updateMutation.isPending}
                    />
                </>
            )}
        </div>
    );
}
