import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SupplierForm, defaultSupplierFormValues } from "./SupplierForm";
import type { SupplierFormValues } from "@/schemas/supplier.schema";

import { api } from "@/api/client";
import type { Supplier } from "@/types/supplier";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

export function EditSupplier() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de fornecedor - ERP Industrial");

    useEffect(() => {
        if (!id) navigate("/suppliers");
    }, [id, navigate]);

    const {
        data: supplier,
        error,
        isLoading,
    } = useQuery<Supplier, Error>({
        enabled: Boolean(id),
        queryKey: ["supplier", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar fornecedor");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar fornecedor");
            }
        },
    });

    const updateMutation = useMutation<Supplier, Error, SupplierFormValues>({
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
                    website: values.website || null,
                    paymentTerms: values.paymentTerms || null,
                    deliveryTime: values.deliveryTime || null,
                    category: values.category || null,
                    notes: values.notes || null,
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

                const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar fornecedor");
                }

                toast.success("Fornecedor alterado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao atualizar o fornecedor.", { id: toastId });
                throw buildApiError(error, "Erro ao atualizar fornecedor");
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

    if (isLoading) {
        return <Loading />;
    }

    const formDefaults: SupplierFormValues = supplier
        ? {
              type: supplier.type,
              status: supplier.status,
              contactName: supplier.contactName || "",
              contactPhone: supplier.contactPhone || "",
              contactEmail: supplier.contactEmail || "",
              website: supplier.website || "",
              paymentTerms: supplier.paymentTerms || "",
              deliveryTime: supplier.deliveryTime || "",
              category: supplier.category || "",
              notes: supplier.notes || "",
              person: {
                  name: supplier.person.name || "",
                  legalName: supplier.person.legalName || "",
                  taxId: supplier.person.taxId || "",
                  nationalId: supplier.person.nationalId || "",
                  email: supplier.person.email || "",
                  phone: supplier.person.phone || "",
                  cellphone: supplier.person.cellphone || "",
                  maritalStatus:
                      (supplier.person
                          .maritalStatus as SupplierFormValues["person"]["maritalStatus"]) ?? null,
                  neighborhood: supplier.person.neighborhood || "",
                  street: supplier.person.street || "",
                  number: supplier.person.number || "",
                  complement: supplier.person.complement || "",
                  postalCode: supplier.person.postalCode || "",
                  notes: supplier.person.notes || "",
                  dateOfBirth: supplier.person.dateOfBirth
                      ? supplier.person.dateOfBirth.split("T")[0]
                      : "",
                  countryId: supplier.person.countryId || null,
                  stateId: supplier.person.stateId || null,
                  cityId: supplier.person.cityId || null,
              },
          }
        : defaultSupplierFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar fornecedor</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados do fornecedor.</p>
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
                    <SupplierForm
                        defaultValues={formDefaults}
                        submitLabel="Atualizar fornecedor"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/suppliers")}
                        isLoading={updateMutation.isPending}
                    />
                </>
            )}
        </div>
    );
}
