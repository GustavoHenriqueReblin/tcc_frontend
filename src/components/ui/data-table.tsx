import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";

import { useState, ReactNode, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Loading } from "../Loading";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Pagination } from "@/types/global";

export interface DataTableMobileField<TData> {
    label: string;
    value: string;
    render?: (value: string, row: TData) => ReactNode;
}

export interface DataTableProps<TData extends object> {
    columns: ColumnDef<TData, unknown>[];
    endpoint: string;
    mobileFields?: DataTableMobileField<TData>[];
    defaultSort?: { sortBy: string; sortOrder: "asc" | "desc" };
    defaultPageSize?: number;
    showSearch?: boolean;
    className?: string;
}

interface ServerList<TData> {
    items: TData[];
    meta: Pagination;
}

export function DataTable<TData extends object>({
    columns,
    endpoint,
    mobileFields = [],
    defaultSort = { sortBy: "id", sortOrder: "asc" },
    defaultPageSize = 5,
    showSearch = true,
    className,
}: DataTableProps<TData>) {
    const isMobile = useIsMobile();

    const [sorting, setSorting] = useState<SortingState>(
        defaultSort
            ? [
                  {
                      id: defaultSort.sortBy,
                      desc: defaultSort.sortOrder === "desc",
                  },
              ]
            : []
    );

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

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
        ],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<TData>>>(endpoint, {
                params: {
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    search,
                    sortBy,
                    sortOrder,
                },
            });
            return response.data;
        },
    });

    const rowsData = data?.data.items ?? [];
    const meta = data?.data.meta ?? { total: 0, page: 1, totalPages: 1 };

    const table = useReactTable({
        data: rowsData,
        columns,
        state: {
            sorting,
            pagination,
        },
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
                    <Input
                        autoFocus
                        placeholder="Pesquisar..."
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                )}

                {isLoading ? (
                    <Loading />
                ) : (
                    <div className="space-y-3">
                        {table.getRowModel().rows.map((row) => {
                            const resolve = (i: number) => {
                                const field = mobileFields[i];
                                if (!field) return "";
                                const value = getDeepValue(row.original, field.value);
                                return field.render ? field.render(value, row.original) : value;
                            };

                            const v0 = resolve(0);
                            const v1 = resolve(1);
                            const v2 = resolve(2);
                            const v3 = resolve(3);

                            return (
                                <div
                                    key={row.id}
                                    className="rounded-lg border p-4 bg-card text-card-foreground"
                                >
                                    <div className="font-medium text-lg truncate mb-1">{v0}</div>
                                    <div className="text-sm text-muted-foreground">{v1}</div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">{v2}</span>
                                        <span className="text-muted-foreground">{v3}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                        Página {pagination.pageIndex + 1} de {meta.totalPages}
                    </p>

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
                <Input
                    autoFocus
                    placeholder="Pesquisar..."
                    className="w-full md:w-72"
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            )}

            <div className="w-full h-full overflow-auto">
                <div className="min-w-full overflow-x-auto rounded-md border bg-card text-card-foreground pb-2">
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
                                                className="text-left px-4 py-3 font-medium"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <>
                                                        {sortable ? (
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

                                                                {header.column.getIsSorted() ===
                                                                    "asc" && (
                                                                    <ArrowUp className="size-3 opacity-100" />
                                                                )}
                                                                {header.column.getIsSorted() ===
                                                                    "desc" && (
                                                                    <ArrowDown className="size-3 opacity-100" />
                                                                )}
                                                                {!header.column.getIsSorted() && (
                                                                    <ArrowUpDown className="size-3 opacity-30" />
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <span>
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                            </span>
                                                        )}
                                                    </>
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
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="border-b hover:bg-muted/30">
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 whitespace-nowrap"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                    Página {pagination.pageIndex + 1} de {meta.totalPages}
                </p>

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
