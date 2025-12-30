import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { DateRange } from "react-day-picker";

import { DataTable } from "@/components/ui/data-table";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { StatusActionButton } from "@/components/StatusActionButton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComboboxStandalone } from "@/components/ComboboxStandalone";
import { EnumStandalone } from "@/components/Fields";
import { DateRangePicker } from "@/components/DateRangePicker";

import type { SaleOrder, SaleOrderServerList } from "@/types/saleOrder";
import type { OrderStatus } from "@/types/global";
import { orderStatusLabels } from "@/types/global";
import { OrderStatusEnum } from "@/types/enums";

import { api } from "@/api/client";
import {
    buildApiError,
    formatCurrency,
    formatDate,
    openPDF,
    toISOEndOfDay,
    toISOStartOfDay,
} from "@/utils/global";

const statusColors: Record<OrderStatus, string> = {
    PENDING: "bg-gray-200 text-gray-800",
    APPROVED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    RECEIVED: "bg-amber-100 text-amber-800",
    FINISHED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
};

type SaleOrderFilters = {
    createdAtFrom?: string;
    createdAtTo?: string;
    customerId?: number | null;
    status?: OrderStatus;
};

type CustomerOption = {
    id: number;
    person?: {
        name?: string | null;
        legalName?: string | null;
    };
};

const customerLabel = (customer: CustomerOption) =>
    customer.person?.name ?? customer.person?.legalName ?? `Cliente #${customer.id}`;

export function SaleOrders() {
    usePageTitle("Vendas - ERP industrial");

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [range, setRange] = useState<DateRange | undefined>();
    const [filters, setFilters] = useState<SaleOrderFilters>({});
    const [subtotalValue, setSubtotalValue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [totalOtherCosts, setTotalOtherCosts] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);

    const updateStatusMutation = useMutation<
        SaleOrder,
        Error,
        { order: SaleOrder; status: OrderStatus }
    >({
        mutationFn: async ({ order, status }) => {
            const toastId = toast.loading("Atualizando venda...");

            try {
                /* eslint-disable @typescript-eslint/no-unused-vars */
                const { items: _items, ...orderWithoutItems } = order;
                const response = await api.put(`/sale-orders/${order.id}`, {
                    ...orderWithoutItems,
                    status,
                });

                const data = response.data as {
                    success: boolean;
                    message?: string;
                    data: SaleOrder;
                };

                if (!data.success) {
                    throw new Error(data.message || "Erro ao atualizar venda");
                }

                toast.success("Venda atualizada com sucesso.", { id: toastId });
                return data.data;
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
        },
    });

    const renderActions = (order: SaleOrder, orientation: "row" | "column" = "row") => {
        const stacked = orientation === "column";
        const buttonClassName = stacked ? "w-full justify-center" : undefined;

        return (
            <div className={`flex gap-2 ${stacked ? "flex-col" : "items-center"}`}>
                {!(
                    order.status === OrderStatusEnum.FINISHED ||
                    order.status === OrderStatusEnum.CANCELED
                ) && (
                    <>
                        <StatusActionButton
                            label="Finalizar"
                            intent="success"
                            className={buttonClassName}
                            confirmTitle="Finalizar venda?"
                            confirmDescription="A venda será marcada como finalizada."
                            confirmLabel="Finalizar"
                            onConfirm={() =>
                                updateStatusMutation.mutate({
                                    order,
                                    status: OrderStatusEnum.FINISHED,
                                })
                            }
                        />
                    </>
                )}

                {!(order.status === OrderStatusEnum.CANCELED) && (
                    <>
                        <StatusActionButton
                            label="Cancelar"
                            intent="danger"
                            className={buttonClassName}
                            confirmTitle="Cancelar venda?"
                            confirmDescription="A venda será marcada como cancelada."
                            confirmLabel="Cancelar venda"
                            onConfirm={() =>
                                updateStatusMutation.mutate({
                                    order,
                                    status: OrderStatusEnum.CANCELED,
                                })
                            }
                        />
                    </>
                )}

                <Button
                    size="sm"
                    variant="outline"
                    className={buttonClassName}
                    onClick={async (e) => {
                        e.stopPropagation();
                        const toastId = toast.loading("Gerando arquivo...");
                        try {
                            await openPDF(order.id, "sale-order");
                            toast.success("Arquivo gerado com sucesso.", { id: toastId });
                        } catch {
                            toast.error("Falha ao gerar o arquivo.", { id: toastId });
                        }
                    }}
                >
                    Visualizar
                </Button>
            </div>
        );
    };

    const renderMobileActions = (order: SaleOrder) => {
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

    const columns: ColumnDef<SaleOrder>[] = [
        {
            accessorKey: "code",
            header: "Código",
            meta: { sortable: true },
        },
        {
            accessorKey: "customer.person.name",
            header: "Cliente",
            meta: { sortable: false },
            enableSorting: false,
            cell: ({ row }) => row.original.customer?.person?.name ?? "",
        },
        {
            accessorKey: "status",
            header: "Status",
            meta: { sortable: true },
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span
                        className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            statusColors[status],
                        ].join(" ")}
                    >
                        {orderStatusLabels[status]}
                    </span>
                );
            },
        },
        {
            header: "Subtotal",
            meta: { sortable: false },
            enableSorting: false,
            cell: ({ row }) =>
                formatCurrency(
                    Number(
                        row.original.items.reduce(
                            (total, item) =>
                                total + Number(item.productUnitPrice) * Number(item.quantity),
                            0
                        ) ?? 0
                    )
                ),
        },
        {
            accessorKey: "discount",
            header: "Desconto",
            meta: { sortable: true },
            cell: ({ row }) => formatCurrency(Number(row.original.discount ?? 0)),
        },
        {
            accessorKey: "otherCosts",
            header: "Outros custos",
            meta: { sortable: true },
            cell: ({ row }) => formatCurrency(Number(row.original.otherCosts ?? 0)),
        },
        {
            accessorKey: "totalValue",
            header: "Valor total",
            meta: { sortable: true },
            cell: ({ row }) =>
                formatCurrency(
                    Number(
                        row.original.items.reduce(
                            (total, item) => total + Number(item.unitPrice) * Number(item.quantity),
                            0
                        ) ?? 0
                    )
                ),
        },
        {
            accessorKey: "createdAt",
            header: "Criada em",
            meta: { sortable: true },
            cell: ({ row }) =>
                row.original.createdAt
                    ? formatDate(new Date(row.original.createdAt), { dateStyle: "short" })
                    : "",
        },
        {
            id: "actions",
            header: "Ações",
            meta: { sortable: false },
            enableSorting: false,
            cell: ({ row }) => renderActions(row.original),
        },
    ];

    const handleRowClick = (row: SaleOrder) => {
        navigate(`/sale-orders/edit/${row.id}`);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vendas</h2>

            <DataTable<SaleOrder>
                columns={columns}
                endpoint="/sale-orders"
                createButtonDescription="Nova venda"
                defaultSort={{ sortBy: "createdAt", sortOrder: "desc" }}
                filters={filters}
                filterComponents={
                    <>
                        <div className="w-full md:w-56">
                            <DateRangePicker
                                value={range}
                                onChange={(selectedRange) => {
                                    if (!selectedRange?.from || !selectedRange?.to) return;

                                    setRange(selectedRange);
                                    setFilters((prev) => ({
                                        ...prev,
                                        createdAtFrom: toISOStartOfDay(selectedRange.from),
                                        createdAtTo: toISOEndOfDay(selectedRange.to),
                                    }));
                                }}
                            />
                        </div>

                        <div className="w-full md:w-56">
                            <ComboboxStandalone<CustomerOption>
                                label="Cliente"
                                endpoint="/customers"
                                valueField="id"
                                labelField="id"
                                formatLabel={customerLabel}
                                value={filters.customerId ?? null}
                                showError={false}
                                onChange={(val) =>
                                    setFilters((prev) => ({ ...prev, customerId: val }))
                                }
                            />
                        </div>

                        <div className="w-full md:w-56">
                            <EnumStandalone
                                label="Status"
                                enumObject={OrderStatusEnum}
                                labels={orderStatusLabels}
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
                mobileFields={[
                    { label: "Código", value: "code" },
                    {
                        label: "Cliente",
                        value: "customer.person.name",
                        render: (_value, row) => row.customer?.person?.name ?? "",
                    },
                    {
                        label: "Status",
                        value: "status",
                        render: (_value, row) => (
                            <span
                                className={[
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                                    statusColors[row.status],
                                ].join(" ")}
                            >
                                {orderStatusLabels[row.status]}
                            </span>
                        ),
                    },
                    {
                        label: "Total",
                        value: "totalValue",
                        render: (_value, row) => formatCurrency(Number(row.totalValue ?? 0)),
                    },
                ]}
                mobileRowActions={renderMobileActions}
                onRowClick={(row) => {
                    if (
                        row.status === OrderStatusEnum.CANCELED ||
                        row.status === OrderStatusEnum.FINISHED
                    ) {
                        toast.info(
                            `Uma venda com status ${orderStatusLabels[row.status]} não pode ser editada.`
                        );
                        return null;
                    }
                    handleRowClick(row);
                }}
                onResult={(result) => {
                    if (!("totals" in result)) return;

                    const totals = (result as SaleOrderServerList<SaleOrder>).totals;

                    setSubtotalValue(totals.subtotal);
                    setTotalDiscount(totals.discount);
                    setTotalOtherCosts(totals.otherCosts);
                    setTotalValue(totals.total);
                }}
            />

            <div className="flex flex-wrap justify-end gap-6 border-t pt-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotalValue)}</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Descontos</span>
                    <span className="font-semibold text-blue-400">
                        {formatCurrency(totalDiscount)}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Outros custos</span>
                    <span className="font-semibold text-red-400">
                        {formatCurrency(totalOtherCosts)}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Valor total</span>
                    <span className="font-semibold text-green-600">
                        {formatCurrency(totalValue)}
                    </span>
                </div>
            </div>
        </div>
    );
}
