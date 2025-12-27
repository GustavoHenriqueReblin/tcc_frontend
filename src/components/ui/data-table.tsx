import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";

import { useState, ReactNode, useEffect, ReactElement } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/global";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, Filter } from "lucide-react";
import { Loading } from "../Loading";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, ServerList } from "@/types/global";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DataTableMobileField<TData> {
    label: string;
    value: string;
    render?: (value: string, row: TData) => ReactNode;
}

export interface DataTableProps<
    TData extends object,
    TFilters extends Record<string, unknown> = Record<string, unknown>,
> {
    columns: ColumnDef<TData, unknown>[];
    endpoint: string;
    createButtonDescription: string;

    filters?: TFilters;
    filterComponents?: ReactNode;
    mobileFields?: DataTableMobileField<TData>[];
    mobileRowActions?: (row: TData) => ReactNode;
    defaultSort?: { sortBy: string; sortOrder: "asc" | "desc" };
    defaultPageSize?: number;
    showSearch?: boolean;
    className?: string;

    onRowClick?: (row: TData) => void;
    onDataResult?: (data: TData[]) => void;
}

function wrapFilterComponents(node: ReactNode, onAnyChange: () => void): ReactNode {
    if (!node) return node;

    if (Array.isArray(node)) {
        return node.map((child) => wrapFilterComponents(child, onAnyChange));
    }

    if (typeof node === "object" && "props" in node) {
        const element = node as ReactElement<{
            onChange?: (...args: unknown[]) => void;
            children?: ReactNode;
        }>;

        if (typeof element.props.onChange === "function") {
            return {
                ...element,
                props: {
                    ...element.props,
                    onChange: (...args: unknown[]) => {
                        element.props.onChange?.(...args);
                        onAnyChange();
                    },
                },
            };
        }

        if (element.props.children) {
            return {
                ...element,
                props: {
                    ...element.props,
                    children: wrapFilterComponents(element.props.children, onAnyChange),
                },
            };
        }
    }

    return node;
}

export function DataTable<TData extends object>({
    columns,
    endpoint,
    createButtonDescription,
    filters,
    filterComponents,
    mobileFields = [],
    mobileRowActions,
    defaultSort = { sortBy: "id", sortOrder: "asc" },
    defaultPageSize = 8,
    showSearch = true,
    className,
    onRowClick,
    onDataResult,
}: DataTableProps<TData>) {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: defaultSort.sortBy,
            desc: defaultSort.sortOrder === "desc",
        },
    ]);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);

    const extractSortKey = (key: string): string => key.split(".").pop()!;

    const currentSort = sorting[0];
    const sortBy =
        currentSort?.id !== undefined
            ? extractSortKey(currentSort.id as string)
            : extractSortKey(defaultSort.sortBy);

    const sortOrder: "asc" | "desc" =
        (currentSort?.desc ?? defaultSort.sortOrder === "desc") ? "desc" : "asc";

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPagination((p) => ({ ...p, pageIndex: 0 }));
            setSearch(searchInput);
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchInput]);

    const { data, isLoading } = useQuery<ApiResponse<ServerList<TData>>>({
        queryKey: [
            "datatable",
            endpoint,
            pagination.pageIndex,
            pagination.pageSize,
            search,
            sortBy,
            sortOrder,
            filters,
        ],
        staleTime: 0,
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<TData>>>(endpoint, {
                params: {
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    search,
                    sortBy,
                    sortOrder,
                    ...filters,
                },
            });

            onDataResult?.(response.data.data.items);
            return response.data;
        },
    });

    const rowsData = data?.data.items ?? [];
    const meta = data?.data.meta ?? { total: 0, page: 1, totalPages: 1 };

    const table = useReactTable({
        data: rowsData,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        manualSorting: true,
        manualPagination: true,
        pageCount: meta.totalPages,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    function getDeepValue(obj: unknown, path: string): string {
        if (obj === null || typeof obj !== "object") return "";
        const keys = path.split(".");
        let current: unknown = obj;

        for (const key of keys) {
            if (
                current &&
                typeof current === "object" &&
                key in (current as Record<string, unknown>)
            ) {
                current = (current as Record<string, unknown>)[key];
            } else {
                return "";
            }
        }

        return current != null ? String(current) : "";
    }

    if (isMobile) {
        return (
            <div className={cn("space-y-4", className)}>
                {showSearch && (
                    <div className="space-y-2">
                        {createButtonDescription && (
                            <Button
                                onClick={() => navigate(`${endpoint}/create`)}
                                className="w-full flex items-center gap-2"
                            >
                                <Plus className="size-4" />
                                <span style={{ fontSize: 13 }}>{createButtonDescription}</span>
                            </Button>
                        )}

                        <div className="flex gap-2">
                            <Input
                                autoFocus={!isMobile}
                                placeholder="Pesquisar..."
                                className="flex-1"
                                onChange={(e) => setSearchInput(e.target.value)}
                            />

                            {filterComponents && (
                                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Filter className="size-4" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-80 max-w-[90vw]">
                                        <div className="flex flex-col gap-4">
                                            {wrapFilterComponents(filterComponents, () =>
                                                setFiltersOpen(false)
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <Loading />
                ) : (
                    <div>
                        {table.getRowModel().rows.map((row) => {
                            const resolve = (i: number) => {
                                const field = mobileFields[i];
                                if (!field) return "";
                                const value = getDeepValue(row.original, field.value);
                                return field.render ? field.render(value, row.original) : value;
                            };

                            const clickableCardProps = onRowClick
                                ? {
                                      role: "button" as const,
                                      tabIndex: 0,
                                      onClick: () => onRowClick?.(row.original),
                                  }
                                : {};

                            const actions = mobileRowActions?.(row.original);

                            return (
                                <div
                                    key={row.id}
                                    className={cn(
                                        "rounded-lg border p-4 bg-card text-card-foreground",
                                        onRowClick &&
                                            "cursor-pointer hover:bg-muted/50 transition-colors"
                                    )}
                                    {...clickableCardProps}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0 space-y-1">
                                            {resolve(0) && (
                                                <div className="font-medium text-lg truncate">
                                                    {resolve(0)}
                                                </div>
                                            )}
                                            {resolve(1) && (
                                                <div className="text-sm text-muted-foreground">
                                                    {resolve(1)}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm">
                                                {resolve(2) && (
                                                    <span className="text-muted-foreground">
                                                        {resolve(2)}
                                                    </span>
                                                )}
                                                {resolve(3) && (
                                                    <span className="text-muted-foreground">
                                                        {resolve(3)}
                                                    </span>
                                                )}
                                                {resolve(4) && (
                                                    <span className="text-muted-foreground">
                                                        {resolve(4)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {actions && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                {actions}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">
                            Página {meta.totalPages ? pagination.pageIndex + 1 : 0} de{" "}
                            {meta.totalPages}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Total de {meta.total} {meta.total > 1 ? "registros" : "registro"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                        >
                            Anterior
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!table.getCanNextPage()}
                            onClick={() => table.nextPage()}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {showSearch && (
                <div className="flex gap-2 items-end flex-wrap">
                    {createButtonDescription && (
                        <Button
                            onClick={() => navigate(`${endpoint}/create`)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            <span style={{ fontSize: 13 }}>{createButtonDescription}</span>
                        </Button>
                    )}

                    <Input
                        autoFocus={!isMobile}
                        placeholder="Pesquisar..."
                        className="w-full md:w-56"
                        onChange={(e) => setSearchInput(e.target.value)}
                    />

                    <div className="flex items-end gap-2 grow">{filterComponents}</div>
                </div>
            )}

            <div className="w-full h-full overflow-auto">
                <div className="min-w-full overflow-x-auto rounded-md border bg-card text-card-foreground">
                    <table className="w-full text-sm min-w-max">
                        <thead className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b">
                                    {headerGroup.headers.map((header) => {
                                        const sortable =
                                            header.column.columnDef.meta?.sortable !== false;

                                        return (
                                            <th
                                                key={header.id}
                                                className="text-left px-4 py-1 font-medium"
                                            >
                                                {header.isPlaceholder ? null : sortable ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        className="px-1 flex items-center gap-1 select-none"
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}

                                                        {header.column.getIsSorted() === "asc" && (
                                                            <ArrowUp className="size-3 opacity-100" />
                                                        )}
                                                        {header.column.getIsSorted() === "desc" && (
                                                            <ArrowDown className="size-3 opacity-100" />
                                                        )}
                                                        {!header.column.getIsSorted() && (
                                                            <ArrowUpDown className="size-3 opacity-30" />
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <div className="px-2 flex items-center gap-1 select-none h-8">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>

                        {isLoading ? (
                            <tbody>
                                {Array.from({ length: 8 }).map((_, row) => (
                                    <tr key={row} className="border-b">
                                        {Array.from({
                                            length: columns.length,
                                        }).map((_, col) => (
                                            <td key={col} className="px-4 py-3">
                                                <div
                                                    className="h-4 rounded bg-muted animate-pulse"
                                                    style={{
                                                        width: `${60 + Math.random() * 80}px`,
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <tbody>
                                {table.getRowModel().rows.map((row) => {
                                    const clickableRowProps = onRowClick
                                        ? {
                                              role: "button" as const,
                                              tabIndex: 0,
                                              onClick: () => onRowClick?.(row.original),
                                          }
                                        : {};

                                    return (
                                        <tr
                                            key={row.id}
                                            className={cn(
                                                "border-b",
                                                onRowClick
                                                    ? "cursor-pointer hover:bg-muted/80"
                                                    : "hover:bg-muted/80"
                                            )}
                                            {...clickableRowProps}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-6 py-3 whitespace-nowrap"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex gap-4">
                    <p className="text-sm text-muted-foreground">
                        Página {meta.totalPages ? pagination.pageIndex + 1 : 0} de {meta.totalPages}
                    </p>
                    <p className="text-sm text-muted-foreground">-</p>
                    <p className="text-sm text-muted-foreground">
                        Total de {meta.total} {meta.total > 1 ? "registros" : "registro"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                    >
                        Anterior
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                    >
                        Próxima
                    </Button>
                </div>
            </div>
        </div>
    );
}
