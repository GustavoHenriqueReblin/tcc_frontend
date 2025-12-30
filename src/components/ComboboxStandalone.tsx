import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn, nextFocus } from "@/utils/global";
import { Label } from "./ui/label";
import { FormItem } from "./ui/form";

interface ComboboxStandaloneProps<TItem> {
    value: number | null;
    onChange: (value: number | null) => void;
    onSelectItem?: (item: TItem) => void;

    label?: string;
    endpoint: string;
    valueField: keyof TItem;
    labelField: keyof TItem;
    formatLabel?: (item: TItem) => string;

    disabled?: boolean;
    extraParams?: Record<string, unknown>;
    showError?: boolean;
}

export function ComboboxStandalone<TItem extends Record<string, unknown>>({
    value,
    onChange,
    label,
    endpoint,
    valueField,
    labelField,
    formatLabel,
    disabled = false,
    extraParams = {},
    showError = true,
    onSelectItem,
}: ComboboxStandaloneProps<TItem>) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ref = useRef<HTMLButtonElement>(null);

    const query = useQuery<TItem[]>({
        queryKey: [endpoint, extraParams, search],
        enabled: !disabled,
        queryFn: async () => {
            const res = await api.get(endpoint, {
                params: {
                    ...extraParams,
                    search: search || undefined,
                },
            });
            return res.data.data.items as TItem[];
        },
        placeholderData: (previous) => previous ?? [],
    });

    const items = useMemo<TItem[]>(() => query.data ?? [], [query.data]);

    const getItemLabel = (item: TItem | undefined): string => {
        if (!item) return "";
        if (formatLabel) return formatLabel(item);
        return String(item[labelField] ?? "");
    };

    const selectedItem = items.find((i) => String(i[valueField]) === String(value));

    const handleSearchChange = (value: string) => {
        if (searchRef.current) {
            clearTimeout(searchRef.current);
        }

        searchRef.current = setTimeout(() => {
            setSearch(value);
        }, 300);
    };

    return (
        <FormItem className="flex flex-col w-full gap-2">
            {label && <Label>{label}</Label>}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    ref={ref}
                    asChild
                    onKeyDown={(e) => {
                        if (e.key === "Enter") nextFocus(e);
                        else if (e.key === "ArrowDown") ref.current?.click();
                    }}
                >
                    <Button
                        disabled={disabled}
                        variant="outline"
                        role="combobox"
                        className="justify-between gap-2"
                    >
                        <span className="truncate">
                            {value
                                ? getItemLabel(selectedItem)
                                : query.isLoading
                                  ? "Carregando..."
                                  : "Selecione..."}
                        </span>

                        <span className="flex items-center gap-1">
                            {value && (
                                <div
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onChange(null);
                                        handleSearchChange("");
                                    }}
                                >
                                    <X className="h-4 w-4 opacity-60 hover:opacity-100 cursor-pointer" />
                                </div>
                            )}
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Buscar..." onValueChange={handleSearchChange} />

                        <CommandList>
                            <CommandEmpty>
                                {query.isLoading ? "Buscando..." : "Nenhum resultado."}
                            </CommandEmpty>

                            {items.map((item) => {
                                const val = Number(item[valueField]);
                                const labelTxt = getItemLabel(item);

                                return (
                                    <CommandItem
                                        className="cursor-pointer"
                                        key={val}
                                        value={String(val)}
                                        onSelect={() => {
                                            onChange(val);
                                            setOpen(false);
                                            onSelectItem?.(item);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === val ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {labelTxt}
                                    </CommandItem>
                                );
                            })}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {showError && <p className="text-xs text-destructive h-4"></p>}
        </FormItem>
    );
}
