import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProductDefinitionForm, defaultProductDefinitionFormValues } from "./ProductDefinitionForm";
import type { ProductDefinitionFormValues } from "@/schemas/product-definition.schema";

import { api } from "@/api/client";
import type { ProductDefinition } from "@/types/productDefinition";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

export function EditProductDefinition() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de definição de produto - ERP industrial");

    useEffect(() => {
        if (!id) navigate("/product-definitions");
    }, [id, navigate]);

    const {
        data: productDefinition,
        error,
        isLoading,
    } = useQuery<ProductDefinition, Error>({
        enabled: Boolean(id),
        queryKey: ["product-definition", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<ProductDefinition>>(
                    `/product-definitions/${id}`
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar definição");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar definição");
            }
        },
    });

    const updateMutation = useMutation<ProductDefinition, Error, ProductDefinitionFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador invalido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteração encontrada.", { id: toastId });
                    return;
                }

                const payload = {
                    name: values.name,
                    description: values.description || null,
                    type: values.type,
                };

                const response = await api.put<ApiResponse<ProductDefinition>>(
                    `/product-definitions/${id}`,
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar definição");
                }

                toast.success("Definição alterada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao atualizar a definição.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao atualizar definição");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/product-definitions"],
                exact: false,
            });

            navigate("/product-definitions");
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    const formDefaults: ProductDefinitionFormValues = productDefinition
        ? {
              name: productDefinition.name || "",
              description: productDefinition.description || "",
              type: productDefinition.type,
          }
        : defaultProductDefinitionFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar definição de produto</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados da definição.</p>
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
                    <ProductDefinitionForm
                        defaultValues={formDefaults}
                        submitLabel="Atualizar definição"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/product-definitions")}
                        isLoading={updateMutation.isPending}
                    />
                </>
            )}
        </div>
    );
}
