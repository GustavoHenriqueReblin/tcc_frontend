import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";

import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Loading } from "../Loading";

export interface DataTableMobileField<TData> {
    label: string;
    value: string;
    render?: (value: string, row: TData) => ReactNode;
}

export interface DataTableProps<TData extends object, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    mobileFields?: DataTableMobileField<TData>[];
    isLoading?: boolean;
    searchable?: boolean;
    className?: string;
}

export function DataTable<TData extends object, TValue>({
    columns,
    data,
    isLoading = false,
    searchable = true,
    className,
    mobileFields = [],
}: DataTableProps<TData, TValue>) {
    const isMobile = useIsMobile();

    const table = useReactTable({
        data,
        columns,
        state: {},
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    function getDeepValue<T extends object>(obj: T, path: string): string {
        if (typeof obj !== "object" || obj === null) return "";

        const keys = path.split(".");

        let current: unknown = obj;

        for (const key of keys) {
            if (typeof current !== "object" || current === null || !(key in current)) {
                return "";
            }

            current = (current as Record<string, unknown>)[key];
        }

        if (current === null || current === undefined) {
            return "";
        }

        return String(current);
    }

    if (isMobile) {
        return (
            <div className={cn("space-y-4", className)}>
                {searchable && (
                    <Input
                        id="table-input"
                        placeholder="Pesquisar..."
                        className="w-full"
                        onChange={(e) => table.setGlobalFilter(e.target.value)}
                    />
                )}

                {isLoading ? (
                    <Loading />
                ) : (
                    <div className="space-y-3">
                        {table.getRowModel().rows.map((row) => {
                            const resolve = (i: number) => {
                                const value = getDeepValue(row.original, mobileFields[i]!.value);

                                return mobileFields[i]?.render
                                    ? mobileFields[i]!.render(value, row.original)
                                    : value;
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
                                        <div className="text-muted-foreground">{v2}</div>
                                        <div className="text-muted-foreground">{v3}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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
            {searchable && (
                <Input
                    id="table-input"
                    placeholder="Pesquisar..."
                    className="w-full md:w-72"
                    onChange={(e) => table.setGlobalFilter(e.target.value)}
                />
            )}

            <div className="w-full h-full overflow-auto">
                <div className="min-w-full overflow-x-auto rounded-md border bg-card text-card-foreground pb-2">
                    <table className="w-full text-sm min-w-max">
                        <thead className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b">
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="text-left px-4 py-3 font-medium"
                                        >
                                            {header.isPlaceholder ? null : (
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
                                                        <ArrowUp
                                                            size={1}
                                                            className="size-3 opacity-100"
                                                        />
                                                    )}

                                                    {header.column.getIsSorted() === "desc" && (
                                                        <ArrowDown className="size-3 opacity-100" />
                                                    )}

                                                    {!header.column.getIsSorted() && (
                                                        <ArrowUpDown className="size-3 opacity-30" />
                                                    )}
                                                </Button>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        {isLoading ? (
                            <tbody>
                                {Array.from({ length: 8 }).map((_, row) => (
                                    <tr key={row} className="border-b">
                                        {Array.from({ length: columns.length }).map((_, col) => (
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
                                                className="px-6 py-3 whitespace-nowrap"
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
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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
