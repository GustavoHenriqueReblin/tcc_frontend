import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProductionOrderForm, defaultProductionOrderFormValues } from "./ProductionOrderForm";
import type { ProductionOrderFormValues } from "@/schemas/productionOrder.schema";

import { api } from "@/api/client";
import type { ProductionOrder } from "@/types/productionOrder";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { ProductionOrderStatusEnum } from "@/types/enums";
import { isEqual } from "lodash-es";
import { Recipe } from "@/types/recipe";

export function EditProductionOrder() {
    const [recipeDefaultValues, setRecipeDefaultValues] = useState<Recipe | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edicao de ordem de produção - ERP Industrial");

    useEffect(() => {
        if (!id) navigate("/production-orders");
    }, [id, navigate]);

    const {
        data: order,
        error,
        isLoading,
    } = useQuery<ProductionOrder, Error>({
        enabled: Boolean(id),
        queryKey: ["production-order", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<ProductionOrder>>(
                    `/production-orders/${id}`
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar ordem");
                }

                const recipeResponse = await api.get<ApiResponse<Recipe>>(
                    `/recipes/${response.data.data.recipeId}`
                );

                if (!recipeResponse.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar ordem");
                }

                setRecipeDefaultValues(recipeResponse.data.data);

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar ordem de produção");
            }
        },
    });

    const formDefaults: ProductionOrderFormValues = order
        ? {
              code: order.code ?? "",
              recipeId: order.recipeId,
              lotId: order.lotId ?? null,
              status: order.status ?? ProductionOrderStatusEnum.PLANNED,
              plannedQty: Number(order.plannedQty ?? 0),
              //   producedQty:
              //       order.producedQty !== null && order.producedQty !== undefined
              //           ? Number(order.producedQty)
              //           : null,
              wasteQty:
                  order.wasteQty !== null && order.wasteQty !== undefined
                      ? Number(order.wasteQty)
                      : null,
              startDate: order.startDate
                  ? new Date(order.startDate).toISOString().split("T")[0]
                  : null,
              endDate: order.endDate ? new Date(order.endDate).toISOString().split("T")[0] : null,
              notes: order.notes ?? "",
          }
        : defaultProductionOrderFormValues;

    const updateMutation = useMutation<ProductionOrder, Error, ProductionOrderFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador invalido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteracao encontrada.", { id: toastId });
                    return;
                }

                const payload = {
                    code: values.code,
                    recipeId: values.recipeId,
                    lotId: values.lotId ?? null,
                    status: values.status ?? ProductionOrderStatusEnum.PLANNED,
                    plannedQty: values.plannedQty,
                    // producedQty: values.producedQty ?? null,
                    wasteQty: values.wasteQty ?? null,
                    startDate: values.startDate || null,
                    endDate: values.endDate || null,
                    notes: values.notes?.trim() || null,
                };

                const response = await api.put<ApiResponse<ProductionOrder>>(
                    `/production-orders/${id}`,
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar ordem");
                }

                toast.success("Ordem de produção atualizada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao atualizar a ordem de produção.", { id: toastId });
                throw buildApiError(error, "Erro ao atualizar ordem de produção");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/production-orders"],
                exact: false,
            });

            navigate("/production-orders");
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar ordem de produção</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados da ordem.</p>
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

                    <ProductionOrderForm
                        defaultValues={formDefaults}
                        recipeDefaultValues={recipeDefaultValues}
                        submitLabel="Atualizar ordem"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/production-orders")}
                        isLoading={updateMutation.isPending}
                    />
                </>
            )}
        </div>
    );
}
