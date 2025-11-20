import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface DataTableMobileField {
    label: string;
    value: string;
}

export interface DataTableProps<TData extends object, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    mobileFields?: DataTableMobileField[];
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
                        placeholder="Pesquisar..."
                        className="w-full"
                        onChange={(e) => table.setGlobalFilter(e.target.value)}
                    />
                )}

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : (
                    <div className="space-y-3">
                        {table.getRowModel().rows.map((row) => (
                            <div
                                key={row.id}
                                className="rounded-lg border p-4 bg-card text-card-foreground space-y-1"
                            >
                                {mobileFields.map((field) => (
                                    <div key={field.value} className="flex justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">
                                            {field.label}:
                                        </span>
                                        <span>{getDeepValue(row.original, field.value)}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
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
                                                    className="px-1"
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
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
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-3" colSpan={columns.length}>
                                            <div className="animate-pulse h-4 w-1/2 bg-muted rounded" />
                                        </td>
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
