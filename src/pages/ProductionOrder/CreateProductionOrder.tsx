import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ProductionOrderForm, defaultProductionOrderFormValues } from "./ProductionOrderForm";
import { type ProductionOrderFormValues } from "@/schemas/production-order.schema";

import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { buildApiError } from "@/utils/global";

import type { ProductionOrder } from "@/types/productionOrder";
import type { ApiResponse } from "@/types/global";
import { ProductionOrderStatusEnum } from "@/types/enums";
import { buildNestedPayload } from "@/utils/buildNestedItems";

export function CreateProductionOrder() {
    usePageTitle("Cadastro de ordem de produção - ERP industrial");
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const mutation = useMutation<ProductionOrder, Error, ProductionOrderFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const inputs = values.inputs.map(({ productId, quantity, unitCost }) => ({
                    productId,
                    quantity,
                    unitCost,
                }));

                const inputsPayload = buildNestedPayload({
                    original: defaultProductionOrderFormValues.inputs ?? [],
                    edited: inputs ?? [],
                    getId: (i) => i.id,
                    isEqual: (o, e) =>
                        o.productId === e.productId &&
                        Number(o.quantity) === Number(e.quantity) &&
                        Number(o.unitCost ?? 0) === Number(e.unitCost ?? 0),
                });

                const payload = {
                    code: values.code,
                    recipeId: values.recipeId,
                    warehouseId: values.warehouseId,
                    lotId: values.lotId ?? null,
                    status: values.status ?? ProductionOrderStatusEnum.PLANNED,
                    plannedQty: values.plannedQty,
                    producedQty: values.producedQty ?? null,
                    wasteQty: values.wasteQty ?? null,
                    otherCosts: values.otherCosts ?? 0,
                    startDate:
                        values.status !== ProductionOrderStatusEnum.PLANNED
                            ? new Date()
                            : values.startDate || null,
                    endDate: values.endDate || null,
                    notes: values.notes?.trim() || null,
                    inputs: inputsPayload,
                };

                const response = await api.post<ApiResponse<ProductionOrder>>(
                    "/production-orders",
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar ordem");
                }

                toast.success("Ordem de produção cadastrada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(
                    error.response.data.message ?? "Falha ao cadastrar a ordem de produção.",
                    { id: toastId }
                );
                throw buildApiError(error, "Erro ao cadastrar ordem de produção");
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

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar ordem de produção</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar uma nova ordem de produção.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <ProductionOrderForm
                defaultValues={defaultProductionOrderFormValues}
                submitLabel="Salvar ordem"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/production-orders")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
