import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { defaultSaleOrderFormValues, SaleOrderForm } from "./SaleOrderForm";
import type { SaleOrderFormValues } from "@/schemas/sale-order.schema";

import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { buildApiError } from "@/utils/global";

import type { SaleOrder } from "@/types/saleOrder";
import type { ApiResponse } from "@/types/global";
import { OrderStatusEnum } from "@/types/enums";
import { buildNestedPayload } from "@/utils/buildNestedItems";

export function CreateSaleOrder() {
    usePageTitle("Cadastro de venda - ERP industrial");

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const mutation = useMutation<SaleOrder, Error, SaleOrderFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const items = values.items.map(
                    ({ productId, quantity, unitPrice, productUnitPrice, unitCost, id }) => ({
                        id,
                        productId,
                        quantity: Number(quantity ?? 0),
                        unitPrice: Number(unitPrice ?? 0),
                        productUnitPrice: Number(productUnitPrice ?? unitPrice ?? 0),
                        unitCost: Number(unitCost ?? 0),
                    })
                );

                const itemsPayload = buildNestedPayload({
                    original: defaultSaleOrderFormValues.items ?? [],
                    edited: items ?? [],
                    getId: (i) => i.id,
                    isEqual: (o, e) =>
                        o.productId === e.productId &&
                        Number(o.quantity) === Number(e.quantity) &&
                        Number(o.unitPrice) === Number(e.unitPrice) &&
                        Number(o.productUnitPrice) === Number(e.productUnitPrice) &&
                        Number(o.unitCost) === Number(e.unitCost),
                });

                const subtotal = items.reduce(
                    (total, item) => total + Number(item.quantity) * Number(item.unitPrice),
                    0
                );

                const discount = values.discount ?? 0;
                const otherCosts = values.otherCosts ?? 0;

                const payload = {
                    customerId: values.customerId,
                    warehouseId: values.warehouseId,
                    code: values.code.trim(),
                    status: values.status ?? OrderStatusEnum.PENDING,
                    discount,
                    otherCosts,
                    totalValue: Math.max(subtotal - discount + otherCosts, 0),
                    notes: values.notes?.trim() || null,
                    items: itemsPayload,
                };

                const response = await api.post<ApiResponse<SaleOrder>>("/sale-orders", payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar venda");
                }

                toast.success("Venda cadastrada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response?.data?.message ?? "Falha ao cadastrar a venda.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao cadastrar venda");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/sale-orders"],
                exact: false,
            });

            navigate("/sale-orders");
        },
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar venda</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar uma nova venda.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <SaleOrderForm
                defaultValues={defaultSaleOrderFormValues}
                submitLabel="Salvar venda"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/sale-orders")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
