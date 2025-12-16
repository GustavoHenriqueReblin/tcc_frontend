import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import type { ProductionOrder } from "@/types/productionOrder";
import { ApiResponse, ProductionOrderStatus, productionOrderStatusLabels } from "@/types/global";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ProductionOrderStatusEnum } from "@/types/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/client";
import { buildApiError } from "@/utils/global";
import { StatusActionButton } from "@/components/StatusActionButton";
import { useState } from "react";
import { FinishProductionOrderValues } from "@/schemas/production-order.schema";
import { FinishProductionOrderModal } from "./FinishProductionOrderModal";
import { Button } from "@/components/ui/button";

const productionOrderStatusColors: Record<ProductionOrderStatus, string> = {
    PLANNED: "bg-gray-200 text-gray-800",
    RUNNING: "bg-blue-100 text-blue-800",
    FINISHED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
};

type UpdateStatusPayload = {
    order: ProductionOrder;
    status: ProductionOrderStatus;
};

export function ProductionOrders() {
    const [finishOrder, setFinishOrder] = useState<ProductionOrder | null>(null);
    usePageTitle("Ordens de produção - ERP Industrial");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const finishOrderMutation = useMutation<
        ProductionOrder,
        Error,
        { values: FinishProductionOrderValues; order: ProductionOrder }
    >({
        mutationFn: async ({ values, order }) => {
            const toastId = toast.loading("Finalizando produção...");

            try {
                const payload = {
                    ...order,
                    status: ProductionOrderStatusEnum.FINISHED,
                    producedQty: values.producedQty,
                    wasteQty: values.wasteQty ?? null,
                    endDate: values.endDate ?? null,
                    notes: values.notes?.trim() || null,
                };

                const response = await api.put<ApiResponse<ProductionOrder>>(
                    `/production-orders/${order.id}`,
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                toast.success("Ordem de produção finalizada.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao finalizar produção.", { id: toastId });
                throw buildApiError(error, "Erro ao finalizar produção");
            }
        },
        onSuccess: () => {
            setFinishOrder(null);
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/production-orders"],
                exact: false,
            });
        },
    });

    const updateStatusMutation = useMutation<ProductionOrder, Error, UpdateStatusPayload>({
        mutationFn: async ({ order, status }) => {
            const toastId = toast.loading("Atualizando ordem de produção...");

            try {
                const payload = {
                    ...order,
                    status,
                };

                const response = await api.put<ApiResponse<ProductionOrder>>(
                    `/production-orders/${order.id}`,
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
        },
    });

    const columns: ColumnDef<ProductionOrder>[] = [
        {
            accessorKey: "code",
            id: "code",
            header: "Código",
            meta: { sortable: true },
        },
        {
            accessorKey: "product.name",
            id: "product.name",
            header: "Produto",
            meta: { sortable: true },
            cell: ({ row }) => row.original.recipe.product?.name ?? "",
        },
        {
            accessorKey: "status",
            id: "status",
            header: "Status",
            meta: { sortable: true },
            cell: ({ row }) => {
                const status = row.original.status;

                return (
                    <div
                        className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium w-fit",
                            productionOrderStatusColors[status] ?? "bg-gray-100 text-gray-800",
                        ].join(" ")}
                    >
                        {productionOrderStatusLabels[status] ?? status}
                    </div>
                );
            },
        },
        {
            accessorKey: "plannedQty",
            id: "plannedQty",
            header: "Qtd. planejada",
            meta: { sortable: true },
            cell: ({ row }) =>
                Number(row.original.plannedQty ?? 0).toLocaleString("pt-BR") +
                " " +
                row.original.recipe.product.unity.simbol,
        },
        {
            accessorKey: "producedQty",
            id: "producedQty",
            header: "Qtd. produzida",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.producedQty != null
                    ? Number(row.original.producedQty).toLocaleString("pt-BR") +
                      " " +
                      row.original.recipe.product.unity.simbol
                    : "",
        },
        {
            accessorKey: "startDate",
            id: "startDate",
            header: "Início",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.startDate
                    ? new Date(row.original.startDate).toLocaleDateString("pt-BR")
                    : "",
        },
        {
            accessorKey: "endDate",
            id: "endDate",
            header: "Fim",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.endDate
                    ? new Date(row.original.endDate).toLocaleDateString("pt-BR")
                    : "",
        },
        {
            id: "actions",
            header: "Ações",
            enableSorting: false,
            meta: { sortable: false },
            cell: ({ row }) => {
                const order = row.original;

                return (
                    <div className="flex items-center gap-2">
                        {order.status === ProductionOrderStatusEnum.PLANNED && (
                            <>
                                <StatusActionButton
                                    label="Iniciar"
                                    intent="primary"
                                    confirmTitle="Iniciar ordem de produção?"
                                    confirmDescription={
                                        <>
                                            A ordem passará para o status
                                            <strong> Em produção</strong>.
                                            <br />
                                            Deseja continuar?
                                        </>
                                    }
                                    confirmLabel="Iniciar produção"
                                    onConfirm={() =>
                                        updateStatusMutation.mutate({
                                            order,
                                            status: ProductionOrderStatusEnum.RUNNING,
                                        })
                                    }
                                />

                                <StatusActionButton
                                    label="Cancelar"
                                    intent="danger"
                                    confirmTitle="Cancelar ordem de produção?"
                                    confirmDescription="Esta ação irá cancelar a ordem de produção."
                                    confirmLabel="Cancelar ordem"
                                    onConfirm={() =>
                                        updateStatusMutation.mutate({
                                            order,
                                            status: ProductionOrderStatusEnum.CANCELED,
                                        })
                                    }
                                />
                            </>
                        )}

                        {order.status === ProductionOrderStatusEnum.RUNNING && (
                            <>
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFinishOrder({
                                            ...order,
                                            plannedQty: Number(order.plannedQty),
                                        });
                                    }}
                                >
                                    Finalizar
                                </Button>

                                <StatusActionButton
                                    label="Cancelar"
                                    intent="danger"
                                    confirmTitle="Cancelar ordem de produção?"
                                    confirmDescription="Esta ação irá cancelar a ordem de produção."
                                    confirmLabel="Cancelar ordem"
                                    onConfirm={() =>
                                        updateStatusMutation.mutate({
                                            order,
                                            status: ProductionOrderStatusEnum.CANCELED,
                                        })
                                    }
                                />
                            </>
                        )}

                        {(order.status === ProductionOrderStatusEnum.FINISHED ||
                            order.status === ProductionOrderStatusEnum.CANCELED) && (
                            <span className="text-xs text-muted-foreground">—</span>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleRowClick = (row: ProductionOrder) => {
        navigate(`/production-orders/edit/${row.id}`);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Ordens de produção</h2>
            </div>

            <DataTable<ProductionOrder>
                columns={columns}
                endpoint="/production-orders"
                createButtonDescription="Nova ordem de produção"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                onRowClick={(row) => {
                    if (
                        row.status === ProductionOrderStatusEnum.CANCELED ||
                        row.status === ProductionOrderStatusEnum.FINISHED
                    ) {
                        toast.info(
                            `Uma ordem com status ${productionOrderStatusLabels[row.status]} não pode ser editada.`
                        );
                        return null;
                    }

                    handleRowClick(row);
                }}
                mobileFields={[
                    { label: "Código", value: "code" },
                    { label: "Produto", value: "product.name" },
                    {
                        label: "Status",
                        value: "status",
                        render: (v, row) =>
                            productionOrderStatusLabels[(row as ProductionOrder).status] ?? v,
                    },
                ]}
            />

            {finishOrder && (
                <FinishProductionOrderModal
                    open
                    order={finishOrder}
                    isLoading={finishOrderMutation.isPending}
                    onOpenChange={() => setFinishOrder(null)}
                    onConfirm={(values) => {
                        finishOrderMutation.mutate({
                            values,
                            order: finishOrder,
                        });
                    }}
                />
            )}
        </div>
    );
}
