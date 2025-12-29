import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

import { SaleOrderForm, defaultSaleOrderFormValues } from "./SaleOrderForm";

import type { SaleOrderFormValues } from "@/schemas/sale-order.schema";
import type { SaleOrder } from "@/types/saleOrder";
import type { ApiResponse } from "@/types/global";

import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { OrderStatusEnum } from "@/types/enums";
import { buildNestedPayload } from "@/utils/buildNestedItems";

export function EditSaleOrder() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de venda - ERP industrial");

    useEffect(() => {
        if (!id) navigate("/sale-orders");
    }, [id, navigate]);

    const {
        data: saleOrder,
        error,
        isLoading,
    } = useQuery<SaleOrder, Error>({
        enabled: Boolean(id),
        queryKey: ["sale-order", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<SaleOrder>>(`/sale-orders/${id}`);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar venda");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar venda");
            }
        },
    });

    const updateMutation = useMutation<SaleOrder, Error, SaleOrderFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador inválido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteração encontrada.", { id: toastId });
                    return;
                }

                const editedItems = values.items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: Number(item.quantity ?? 0),
                    unitPrice: Number(item.unitPrice ?? 0),
                    productUnitPrice: Number(item.productUnitPrice ?? item.unitPrice ?? 0),
                    unitCost: Number(item.unitCost ?? 0),
                }));

                const originalItems =
                    saleOrder?.items?.map((item) => ({
                        id: item.id,
                        productId: item.productId,
                        quantity: Number(item.quantity ?? 0),
                        unitPrice: Number(item.unitPrice ?? 0),
                        productUnitPrice: Number(item.productUnitPrice ?? item.unitPrice ?? 0),
                        unitCost: Number(item.unitCost ?? 0),
                    })) ?? [];

                const itemsPayload = buildNestedPayload({
                    original: originalItems,
                    edited: editedItems,
                    getId: (i) => i.id,
                    isEqual: (o, e) =>
                        o.productId === e.productId &&
                        Number(o.quantity) === Number(e.quantity) &&
                        Number(o.unitPrice) === Number(e.unitPrice) &&
                        Number(o.productUnitPrice) === Number(e.productUnitPrice) &&
                        Number(o.unitCost) === Number(e.unitCost),
                });

                const subtotal = editedItems.reduce(
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

                const response = await api.put<ApiResponse<SaleOrder>>(
                    `/sale-orders/${id}`,
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar venda");
                }

                toast.success("Venda atualizada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response?.data?.message ?? "Falha ao atualizar a venda.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao atualizar venda");
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

    if (isLoading) {
        return <Loading />;
    }

    const formDefaults: SaleOrderFormValues = saleOrder
        ? {
              customerId: saleOrder.customerId ?? null,
              warehouseId: saleOrder.warehouseId ?? null,
              code: saleOrder.code ?? "",
              status: saleOrder.status ?? OrderStatusEnum.PENDING,
              discount: saleOrder.discount ?? 0,
              otherCosts: saleOrder.otherCosts ?? 0,
              notes: saleOrder.notes ?? "",
              items:
                  saleOrder.items?.map((item) => ({
                      id: item.id,
                      productId: item.productId,
                      quantity: Number(item.quantity ?? 0),
                      unitPrice: Number(item.unitPrice ?? 0),
                      productUnitPrice: Number(item.productUnitPrice ?? item.unitPrice ?? 0),
                      unitCost: Number(item.unitCost ?? 0),

                      // UI
                      productName: item.product?.name,
                      unitySimbol: item.product?.unity?.simbol,
                  })) ?? [],
          }
        : defaultSaleOrderFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar venda</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados da venda.</p>
            </div>

            {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error.message}
                </div>
            ) : (
                <>
                    {updateMutation.error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {updateMutation.error.message}
                        </div>
                    )}

                    <SaleOrderForm
                        defaultValues={formDefaults}
                        submitLabel="Atualizar venda"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/sale-orders")}
                        isLoading={updateMutation.isPending}
                    />
                </>
            )}
        </div>
    );
}
