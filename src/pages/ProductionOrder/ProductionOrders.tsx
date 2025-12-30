import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import type { ProductionOrder } from "@/types/productionOrder";
import {
    ApiResponse,
    ProductionOrderStatus,
    productionOrderStatusLabels,
    ServerList,
} from "@/types/global";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ProductDefinitionTypeEnum, ProductionOrderStatusEnum } from "@/types/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/client";
import {
    buildApiError,
    cn,
    formatDate,
    formatNumber,
    openPDF,
    toISOEndOfDay,
    toISOStartOfDay,
} from "@/utils/global";
import { StatusActionButton } from "@/components/StatusActionButton";
import { useState } from "react";
import { FinishProductionOrderValues } from "@/schemas/production-order.schema";
import { FinishProductionOrderModal } from "./FinishProductionOrderModal";
import { Button } from "@/components/ui/button";
import { ComboboxStandalone } from "@/components/ComboboxStandalone";
import { EnumStandalone } from "@/components/Fields";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ProductDefinition } from "@/types/product";

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

type ProductionOrderFilters = {
    status?: ProductionOrderStatus;
    productId?: number;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
};

export function ProductionOrders() {
    usePageTitle("Ordens de produção - ERP industrial");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isMobile = useIsMobile();

    const [range, setRange] = useState<DateRange | undefined>();
    const [filters, setFilters] = useState<ProductionOrderFilters>({});
    const [finishOrder, setFinishOrder] = useState<ProductionOrder | null>(null);
    const [totalOrders, setTotalOrders] = useState(0);
    const [plannedOrders, setPlannedOrders] = useState(0);
    const [runningOrders, setRunningOrders] = useState(0);
    const [finishedOrders, setFinishedOrders] = useState(0);
    const [plannedQty, setPlannedQty] = useState(0);
    const [producedQty, setProducedQty] = useState(0);
    const [wasteQty, setWasteQty] = useState(0);

    const { data: finishedProductDefinition } = useQuery<ProductDefinition>({
        queryKey: ["product-definition", ProductDefinitionTypeEnum.FINISHED_PRODUCT],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<ProductDefinition>>>(
                "/product-definitions",
                {
                    params: {
                        type: ProductDefinitionTypeEnum.FINISHED_PRODUCT,
                        limit: 1,
                    },
                }
            );

            if (!response.data.success || response.data.data.items.length === 0) {
                throw new Error("Definição de matéria-prima não encontrada");
            }

            return response.data.data.items[0];
        },
    });

    const finishOrderMutation = useMutation<
        ProductionOrder,
        Error,
        { values: FinishProductionOrderValues; order: ProductionOrder }
    >({
        mutationFn: async ({ values, order }) => {
            const toastId = toast.loading("Finalizando produção...");

            try {
                if (new Date(order.endDate ?? values.endDate) < new Date(order.startDate)) {
                    toast.error("Data da finalização não pode ser anterior à data de início", {
                        id: toastId,
                    });
                    return;
                }

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
                toast.error(error.response.data.message ?? "Falha ao finalizar produção.", {
                    id: toastId,
                });
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
                    startDate:
                        status === ProductionOrderStatusEnum.RUNNING ? new Date() : order.startDate,
                };

                const response = await api.put<ApiResponse<ProductionOrder>>(
                    `/production-orders/${order.id}`,
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar ordem");
                }

                toast.success("Ordem de produção atualizada com sucesso.", {
                    id: toastId,
                });
                return response.data.data;
            } catch (error) {
                toast.error(
                    error.response.data.message ?? "Falha ao atualizar a ordem de produção.",
                    {
                        id: toastId,
                    }
                );
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

    const renderActions = (order: ProductionOrder, orientation: "row" | "column" = "row") => {
        if (order.status === ProductionOrderStatusEnum.CANCELED) return null;

        const stacked = orientation === "column";
        const buttonClassName = stacked ? "w-full justify-center" : undefined;

        return (
            <div className={cn("flex gap-2", stacked ? "flex-col" : "items-center")}>
                {order.status === ProductionOrderStatusEnum.PLANNED && (
                    <>
                        <StatusActionButton
                            label="Iniciar"
                            intent="primary"
                            className={buttonClassName}
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
                    </>
                )}

                {order.status === ProductionOrderStatusEnum.RUNNING && (
                    <>
                        <Button
                            size="sm"
                            variant="success"
                            className={buttonClassName}
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
                    </>
                )}

                <StatusActionButton
                    label="Cancelar"
                    intent="danger"
                    className={buttonClassName}
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

                <Button
                    size="sm"
                    variant="outline"
                    className={buttonClassName}
                    onClick={async (e) => {
                        e.stopPropagation();
                        const toastId = toast.loading("Gerando arquivo...");
                        try {
                            await openPDF(order.id, "production-order");
                            toast.success("Arquivo gerado com sucesso.", {
                                id: toastId,
                            });
                        } catch (error) {
                            console.log(error);
                            toast.success("Falha ao gerar o arquivo.", {
                                id: toastId,
                            });
                        }
                    }}
                >
                    Visualizar
                </Button>
            </div>
        );
    };

    const renderMobileActions = (order: ProductionOrder) => {
        const actions = renderActions(order, "column");

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Ações"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2.5rem)] max-w-80 p-2">
                    {actions}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const columns: ColumnDef<ProductionOrder>[] = [
        {
            accessorKey: "code",
            header: "Código",
            meta: { sortable: true },
        },
        {
            accessorKey: "product.name",
            header: "Produto",
            meta: { sortable: true },
            cell: ({ row }) => row.original.recipe.product?.name ?? "",
        },
        {
            accessorKey: "status",
            header: "Status",
            meta: { sortable: true },
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <div
                        className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            productionOrderStatusColors[status],
                        ].join(" ")}
                    >
                        {productionOrderStatusLabels[status]}
                    </div>
                );
            },
        },
        {
            accessorKey: "plannedQty",
            header: "Qtd. planejada",
            meta: { sortable: true },
            cell: ({ row }) =>
                `${formatNumber(Number(row.original.plannedQty ?? 0))} ${
                    row.original.recipe.product.unity.simbol
                }`,
        },
        {
            accessorKey: "producedQty",
            header: "Qtd. produzida",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.producedQty != null
                    ? `${formatNumber(Number(row.original.producedQty))} ${
                          row.original.recipe.product.unity.simbol
                      }`
                    : "",
        },
        {
            accessorKey: "startDate",
            header: "Início",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.startDate
                    ? formatDate(new Date(row.original.startDate), {
                          dateStyle: "short",
                          timeStyle: "short",
                      })
                    : "",
        },
        {
            accessorKey: "endDate",
            header: "Término",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.endDate
                    ? formatDate(new Date(row.original.endDate), {
                          dateStyle: "short",
                          timeStyle: "short",
                      })
                    : "",
        },
        {
            id: "actions",
            header: "Ações",
            enableSorting: false,
            meta: { sortable: false },
            cell: ({ row }) => {
                const order = row.original;

                return renderActions(order);
            },
        },
    ];

    const handleRowClick = (row: ProductionOrder) => {
        navigate(`/production-orders/edit/${row.id}`);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ordens de produção</h2>

            <DataTable<ProductionOrder>
                columns={columns}
                endpoint="/production-orders"
                createButtonDescription="Nova OP"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                mobileFields={[
                    { label: "Código", value: "code" },
                    {
                        label: "Produto",
                        value: "recipe.product.name",
                        render: (_value, row) => row.recipe?.product?.name ?? "",
                    },
                    {
                        label: "Status",
                        value: "status",
                        render: (_value, row) => (
                            <span
                                className={[
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                                    productionOrderStatusColors[row.status],
                                ].join(" ")}
                            >
                                {productionOrderStatusLabels[row.status] ?? ""}
                            </span>
                        ),
                    },
                    {
                        label: "Planejado",
                        value: "plannedQty",
                        render: (_value, row) => {
                            const plannedQty = row.plannedQty ?? null;
                            const unity = row.recipe?.product?.unity?.simbol ?? "";
                            return plannedQty != null
                                ? `${formatNumber(Number(plannedQty))} ${unity}`.trim()
                                : "";
                        },
                    },
                ]}
                mobileRowActions={renderMobileActions}
                filters={filters}
                filterComponents={
                    <>
                        <div className={cn(isMobile ? "w-full" : "w-56")}>
                            <DateRangePicker
                                value={range}
                                onChange={(range) => {
                                    if (!range?.from || !range?.to) return;

                                    setRange(range);

                                    setFilters((prev) => ({
                                        ...prev,
                                        startDateFrom: toISOStartOfDay(range.from),
                                        startDateTo: toISOEndOfDay(range.to),
                                        endDateFrom: toISOStartOfDay(range.from),
                                        endDateTo: toISOEndOfDay(range.to),
                                    }));
                                }}
                            />
                        </div>

                        <div className={cn(isMobile ? "w-full" : "w-56")}>
                            <ComboboxStandalone
                                label="Produto"
                                endpoint="/products"
                                extraParams={
                                    finishedProductDefinition
                                        ? { productDefinitionId: finishedProductDefinition.id }
                                        : undefined
                                }
                                valueField="id"
                                labelField="name"
                                value={filters.productId || null}
                                showError={false}
                                onChange={(val) =>
                                    setFilters((prev) => ({ ...prev, productId: val }))
                                }
                            />
                        </div>

                        <div className={cn(isMobile ? "w-full" : "w-56")}>
                            <EnumStandalone
                                label="Status"
                                enumObject={ProductionOrderStatusEnum}
                                labels={productionOrderStatusLabels}
                                value={filters.status ?? null}
                                onChange={(val) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: val ?? undefined,
                                    }))
                                }
                            />
                        </div>
                    </>
                }
                onRowClick={(row) => {
                    if (
                        row.status === ProductionOrderStatusEnum.CANCELED ||
                        row.status === ProductionOrderStatusEnum.FINISHED
                    ) {
                        toast.info(
                            `Uma ordem com status ${
                                productionOrderStatusLabels[row.status]
                            } não pode ser editada.`
                        );
                        return null;
                    }
                    handleRowClick(row);
                }}
                onDataResult={(data) => {
                    let planned = 0;
                    let produced = 0;
                    let waste = 0;
                    let plannedC = 0;
                    let runningC = 0;
                    let finishedC = 0;

                    data.forEach((o) => {
                        planned += Number(o.plannedQty ?? 0);
                        produced += Number(o.producedQty ?? 0);
                        waste += Number(o.wasteQty ?? 0);

                        if (o.status === ProductionOrderStatusEnum.PLANNED) plannedC++;
                        if (o.status === ProductionOrderStatusEnum.RUNNING) runningC++;
                        if (o.status === ProductionOrderStatusEnum.FINISHED) finishedC++;
                    });

                    setTotalOrders(data.length);
                    setPlannedOrders(plannedC);
                    setRunningOrders(runningC);
                    setFinishedOrders(finishedC);
                    setPlannedQty(planned);
                    setProducedQty(produced);
                    setWasteQty(waste);
                }}
            />

            <div className="flex flex-wrap justify-end gap-6 border-t pt-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Total de ordens</span>
                    <span className="font-semibold">{totalOrders}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Planejadas</span>
                    <span className="font-semibold">{plannedOrders}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Em produção</span>
                    <span className="font-semibold">{runningOrders}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Finalizadas</span>
                    <span className="font-semibold">{finishedOrders}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Qtd. planejada</span>
                    <span className="font-semibold text-gray-400">{formatNumber(plannedQty)}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Qtd. produzida</span>
                    <span className="font-semibold text-green-400">
                        {formatNumber(producedQty)}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Perdas registradas</span>
                    <span className="font-semibold text-red-400">{formatNumber(wasteQty)}</span>
                </div>
            </div>

            {finishOrder && (
                <FinishProductionOrderModal
                    open
                    order={finishOrder}
                    isLoading={finishOrderMutation.isPending}
                    onOpenChange={() => setFinishOrder(null)}
                    onConfirm={(values) =>
                        finishOrderMutation.mutate({
                            values,
                            order: finishOrder,
                        })
                    }
                />
            )}
        </div>
    );
}
