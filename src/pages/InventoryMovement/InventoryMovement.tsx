import { JSX, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    CalendarClock,
    Factory,
    Leaf,
    Package,
    Receipt,
    Search,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ComboboxStandalone } from "@/components/ComboboxStandalone";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
    cn,
    formatCurrency,
    formatDate,
    formatNumber,
    toISOEndOfDay,
    toISOStartOfDay,
} from "@/utils/global";
import type { ApiResponse, ServerList } from "@/types/global";
import { MovementSourceEnum, MovementTypeEnum } from "@/types/enums";
import { InventoryMovement } from "@/types/inventoryMovement";
import { movementSourceLabels } from "@/types/global";

type PeriodShortcut = "today" | "7d" | "30d" | "custom";

const movementTypeStyles: Record<keyof typeof MovementTypeEnum, string> = {
    IN: "bg-red-50 text-red-700 border-red-100",
    OUT: "bg-emerald-50 text-emerald-800 border-emerald-100",
};

const movementTypeLabels: Record<keyof typeof MovementTypeEnum, string> = {
    IN: "Entrada",
    OUT: "Saída",
};

const sourceIcons: Record<keyof typeof MovementSourceEnum, JSX.Element> = {
    PURCHASE: <Package className="size-3.5" />,
    HARVEST: <Leaf className="size-3.5" />,
    SALE: <Receipt className="size-3.5" />,
    ADJUSTMENT: <ArrowUpRight className="size-3.5" />,
    PRODUCTION: <Factory className="size-3.5" />,
};

export function InventoryMovementPage() {
    usePageTitle("Movimentação de estoque - ERP industrial");

    const [period, setPeriod] = useState<PeriodShortcut>("7d");
    const [customRange, setCustomRange] = useState<DateRange | undefined>();

    const [productId, setProductId] = useState<number | null>(null);
    const [typeFilter, setTypeFilter] = useState<keyof typeof MovementTypeEnum | null>(null);
    const [sourceFilter, setSourceFilter] = useState<keyof typeof MovementSourceEnum | null>(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(timeout);
    }, [search]);

    const range = useMemo<DateRange | undefined>(() => {
        if (period === "custom") return customRange;

        const now = new Date();
        let from = new Date(now);

        if (period === "today") {
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        if (period === "7d") {
            from.setDate(now.getDate() - 6);
        }
        if (period === "30d") {
            from.setDate(now.getDate() - 29);
        }

        return { from, to: now };
    }, [period, customRange]);

    const startDate = range?.from ? toISOStartOfDay(range.from) : undefined;
    const endDate = range?.to ? toISOEndOfDay(range.to) : undefined;

    const { data, isLoading, isFetching } = useQuery<ApiResponse<ServerList<InventoryMovement>>>({
        queryKey: [
            "inventory-movement-timeline",
            {
                productId,
                startDate,
                endDate,
                typeFilter,
                sourceFilter,
                debouncedSearch,
            },
        ],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<InventoryMovement>>>(
                "/inventory-movement",
                {
                    params: {
                        page: 1,
                        limit: 200,
                        sortBy: "createdAt",
                        sortOrder: "desc",
                        productId,
                        startDate,
                        endDate,
                        movementType: typeFilter ?? undefined,
                        source: sourceFilter ?? undefined,
                        search: debouncedSearch || undefined,
                    },
                }
            );

            return response.data;
        },
        enabled: !!productId,
    });

    const movements = useMemo(() => data?.data.items ?? [], [data?.data.items]);
    const totals = useMemo(() => {
        let inQty = 0;
        let outQty = 0;

        movements.forEach((m) => {
            if (m.direction === MovementTypeEnum.IN) inQty += Number(m.quantity);
            if (m.direction === MovementTypeEnum.OUT) outQty += Number(m.quantity);
        });

        return {
            inQty,
            outQty,
            net: inQty - outQty,
            balanceAfterLast: movements[0]?.balance ?? null,
        };
    }, [movements]);
    const averages = useMemo(() => {
        let inTotalValue = 0;
        let inTotalQty = 0;

        let outTotalValue = 0;
        let outTotalQty = 0;

        movements.forEach((m) => {
            const qty = Number(m.quantity);
            const unitCost = Number(m.unitCost);
            const saleValue = Number(m.saleValue);

            if (!qty || !unitCost) return;

            if (m.direction === MovementTypeEnum.IN) {
                inTotalQty += qty;
                inTotalValue += qty * unitCost;
            }

            if (m.direction === MovementTypeEnum.OUT) {
                outTotalQty += qty;
                outTotalValue += qty * saleValue;
            }
        });

        return {
            avgInCost: inTotalQty > 0 ? inTotalValue / inTotalQty : null,
            avgOutPrice: outTotalQty > 0 ? outTotalValue / outTotalQty : null,
        };
    }, [movements]);

    const shortcutButton = (label: string, value: PeriodShortcut) => (
        <Button
            key={value}
            variant={period === value ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setPeriod(value)}
        >
            <CalendarClock className="size-4" />
            {label}
        </Button>
    );

    const typeButton = (value: keyof typeof MovementTypeEnum) => (
        <Button
            key={value}
            variant={typeFilter === value ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setTypeFilter((prev) => (prev === value ? null : value))}
        >
            {value === MovementTypeEnum.IN ? (
                <ArrowDownLeft className="size-4 text-red-600" />
            ) : (
                <ArrowUpRight className="size-4 text-emerald-600" />
            )}
            {movementTypeLabels[value]}
        </Button>
    );

    const sourceButton = (value: keyof typeof MovementSourceEnum) => (
        <Button
            key={value}
            variant={sourceFilter === value ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setSourceFilter((prev) => (prev === value ? null : value))}
        >
            {sourceIcons[value]}
            {movementSourceLabels[value]}
        </Button>
    );

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h2 className="text-xl font-semibold">Movimentação de estoque</h2>
                <p className="text-sm text-muted-foreground">
                    Linha do tempo com entradas e saídas, impacto no saldo e rastreabilidade
                    completa.
                </p>

                <div className="max-w-xl">
                    <ComboboxStandalone<{
                        id: number;
                        name: string;
                        unity: {
                            simbol: string;
                        };
                    }>
                        label="Produto *"
                        endpoint="/products"
                        valueField="id"
                        labelField="name"
                        value={productId}
                        onChange={(val) => setProductId(val)}
                        showError={false}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                    <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Saldo após última movimentação
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold">
                                {totals.balanceAfterLast != null
                                    ? formatNumber(totals.balanceAfterLast)
                                    : "--"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {movements[0]?.product?.unity?.simbol ?? ""}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Médias no período
                        </p>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                                <ArrowDownLeft className="size-4 text-red-600" />
                                <span className="text-muted-foreground">Custo médio</span>
                                <span className="ml-auto font-semibold text-red-600">
                                    {averages.avgInCost != null
                                        ? formatCurrency(averages.avgInCost)
                                        : "--"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <ArrowUpRight className="size-4 text-emerald-600" />
                                <span className="text-muted-foreground">Preço médio</span>
                                <span className="ml-auto font-semibold text-emerald-600">
                                    {averages.avgOutPrice != null
                                        ? formatCurrency(averages.avgOutPrice)
                                        : "--"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Impacto no período selecionado
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-red-600">
                                +{formatNumber(totals.inQty)}
                            </span>
                            <span className="text-2xl font-semibold text-emerald-700">
                                -{formatNumber(totals.outQty)}
                            </span>
                            <span
                                className={cn(
                                    "text-sm px-2 py-1.5 rounded-full border",
                                    totals.net >= 0 ? "bg-red-50" : "bg-emerald-50"
                                )}
                            >
                                {totals.net >= 0 ? "+" : ""}
                                {formatNumber(totals.net)}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Último movimento
                        </p>
                        <div className="flex items-center gap-2">
                            <CalendarClock className="size-4 text-muted-foreground" />
                            <span className="text-sm">
                                {movements[0]?.createdAt
                                    ? formatDate(new Date(movements[0].createdAt))
                                    : "--"}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                    {shortcutButton("Hoje", "today")}
                    {shortcutButton("Últimos 7 dias", "7d")}
                    {shortcutButton("Últimos 30 dias", "30d")}

                    <div>
                        <DateRangePicker
                            value={range}
                            showLabel={false}
                            onChange={(nextRange) => {
                                setCustomRange(nextRange);
                                setPeriod("custom");
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {typeButton(MovementTypeEnum.IN)}
                    {typeButton(MovementTypeEnum.OUT)}

                    <div className="w-px h-6 bg-border mx-1" />

                    {sourceButton(MovementSourceEnum.PURCHASE)}
                    {sourceButton(MovementSourceEnum.HARVEST)}
                    {sourceButton(MovementSourceEnum.SALE)}
                    {sourceButton(MovementSourceEnum.ADJUSTMENT)}
                    {sourceButton(MovementSourceEnum.PRODUCTION)}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => {
                            setTypeFilter(null);
                            setSourceFilter(null);
                            setSearch("");
                            setPeriod("7d");
                            setCustomRange(undefined);
                        }}
                    >
                        Limpar filtros
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Filtrar por OP, NF ou observação"
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {isFetching && (
                        <span className="text-xs text-muted-foreground">Atualizando...</span>
                    )}
                </div>
            </section>

            <section className="">
                {productId && isLoading && (
                    <p className="text-sm text-muted-foreground">Carregando movimentações...</p>
                )}

                {!productId && (
                    <div className="flex items-center gap-3 border border-dashed p-4 bg-muted/40 rounded-lg">
                        <Activity className="size-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Selecione um produto</p>
                            <p className="text-sm text-muted-foreground">
                                Escolha o produto para visualizar as movimentações.
                            </p>
                        </div>
                    </div>
                )}

                {productId &&
                    movements.map((movement, idx) => {
                        const isIn = movement.direction === MovementTypeEnum.IN;
                        const qtyColor = isIn ? "text-red-600" : "text-emerald-700";
                        const typeStyle = movementTypeStyles[movement.direction];
                        return (
                            <div key={movement.id} className="relative pl-10 mb-2">
                                <div
                                    className={cn(
                                        "absolute left-0 top-4 flex size-8 items-center justify-center rounded-full border bg-background shadow-sm",
                                        typeStyle
                                    )}
                                >
                                    {isIn ? (
                                        <ArrowDownLeft className="size-4" />
                                    ) : (
                                        <ArrowUpRight className="size-4" />
                                    )}
                                </div>
                                <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={cn(
                                                "px-2.5 py-1 text-xs font-semibold rounded-full border",
                                                typeStyle
                                            )}
                                        >
                                            {movementTypeLabels[movement.direction]}
                                        </span>
                                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                            {sourceIcons[movement.source]}
                                            {movementSourceLabels[movement.source]}
                                        </span>
                                        {movement.reference && (
                                            <span className="text-xs text-muted-foreground">
                                                Ref: {movement.reference}
                                            </span>
                                        )}
                                        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                                            <CalendarClock className="size-4" />
                                            {formatDate(new Date(movement.createdAt), {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-baseline gap-2">
                                            <span
                                                className={cn("text-2xl font-semibold", qtyColor)}
                                            >
                                                {isIn ? "+" : "-"}
                                                {formatNumber(movement.quantity)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {movement.product?.unity?.simbol ?? "un"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground">
                                                Saldo após o movimento
                                            </span>
                                            <span className="font-semibold">
                                                {formatNumber(movement.balance)}{" "}
                                                {movement.product?.unity?.simbol ?? "un"}
                                            </span>
                                        </div>
                                        {movement.unitCost &&
                                            movement.direction === MovementTypeEnum.IN && (
                                                <div className="max-w-xl flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Custo unitário
                                                    </span>
                                                    <p className="text-sm">
                                                        {formatCurrency(Number(movement.unitCost))}
                                                    </p>
                                                </div>
                                            )}
                                        {movement.saleValue &&
                                            movement.direction === MovementTypeEnum.OUT && (
                                                <div className="max-w-xl flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Preço de venda
                                                    </span>
                                                    <p className="text-sm">
                                                        {formatCurrency(Number(movement.saleValue))}
                                                    </p>
                                                </div>
                                            )}
                                        {movement.unitCost &&
                                            movement.quantity &&
                                            movement.direction === MovementTypeEnum.IN && (
                                                <div className="max-w-xl flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Total
                                                    </span>
                                                    <p className="text-sm">
                                                        {formatCurrency(
                                                            Number(movement.quantity) *
                                                                Number(movement.unitCost)
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        {movement.saleValue &&
                                            movement.quantity &&
                                            movement.direction === MovementTypeEnum.OUT && (
                                                <div className="max-w-xl flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Total
                                                    </span>
                                                    <p className="text-sm">
                                                        {formatCurrency(
                                                            Number(movement.quantity) *
                                                                Number(movement.saleValue)
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        {movement.notes && (
                                            <div className="max-w-xl">
                                                <span className="text-xs text-muted-foreground">
                                                    Observação
                                                </span>
                                                <p className="text-sm">{movement.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                    {movement.balance <= 0 && (
                                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                            <AlertTriangle className="size-4" /> Atenção: saldo
                                            crítico após este movimento.
                                        </div>
                                    )}
                                </div>
                                {idx !== movements.length - 1 && (
                                    <div className="absolute left-[15px] top-12 h-full w-px bg-border" />
                                )}
                            </div>
                        );
                    })}
            </section>
        </div>
    );
}
