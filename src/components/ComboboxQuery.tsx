import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Control, FieldPath, FieldValues, useWatch, useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";

import { api } from "@/api/client";
import { ApiResponse, ServerList } from "@/types/global";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";

import { cn, nextFocus, normalizeString } from "@/utils/global";

interface ComboboxQueryProps<
    TFieldValues extends FieldValues,
    TItem extends Record<string, unknown>,
> {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;

    endpoint: string;
    valueField: keyof TItem;
    labelField: keyof TItem;
    formatLabel?: (item: TItem) => string;

    disabled?: boolean;
    extraParams?: Record<string, unknown>;
    onSelectItem?: (item: TItem) => void;
}

export function ComboboxQuery<
    TFieldValues extends FieldValues,
    TItem extends Record<string, unknown>,
>({
    control,
    name,
    label,
    endpoint,
    valueField,
    labelField,
    formatLabel,
    disabled = false,
    extraParams = {},
    onSelectItem,
}: ComboboxQueryProps<TFieldValues, TItem>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    const { setValue } = useFormContext<TFieldValues>();
    const value = useWatch({ control, name });

    const query = useQuery({
        queryKey: [endpoint, extraParams],
        queryFn: async () => {
            const res = await api.get<ApiResponse<ServerList<TItem>>>(endpoint, {
                params: extraParams,
            });
            return res.data.data.items;
        },
    });

    const items = useMemo<TItem[]>(() => query.data ?? [], [query.data]);

    const getItemLabel = (item?: TItem) => {
        if (!item) return "";
        if (formatLabel) return formatLabel(item);
        const raw = item[labelField];
        return raw == null ? "" : String(raw);
    };

    useEffect(() => {
        if (disabled || value != null || items.length !== 1) return;

        const item = items[0];
        const selectedValue = Number(item[valueField]);

        setValue(name, selectedValue as TFieldValues[typeof name], {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });

        onSelectItem?.(item);
    }, [items, value, disabled, name, setValue, onSelectItem, valueField]);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                    <FormLabel>{label}</FormLabel>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger
                            ref={ref}
                            asChild
                            onKeyDown={(e) => {
                                switch (e.key) {
                                    case "Enter":
                                        nextFocus(e);
                                        break;
                                    case "ArrowDown":
                                        ref.current?.click();
                                        break;
                                    default:
                                        break;
                                }
                            }}
                        >
                            <FormControl>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    role="combobox"
                                    className="justify-between"
                                >
                                    {field.value
                                        ? getItemLabel(
                                              items.find(
                                                  (i) =>
                                                      String(i[valueField]) === String(field.value)
                                              )
                                          )
                                        : query.isLoading
                                          ? "Carregando..."
                                          : "Selecione..."}

                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                            <Command>
                                <CommandInput placeholder="Buscar..." />
                                <CommandList>
                                    <CommandEmpty>Nenhum resultado.</CommandEmpty>

                                    {items.map((item) => {
                                        const valueStr = String(item[valueField]);
                                        const labelText = getItemLabel(item);

                                        return (
                                            <CommandItem
                                                key={valueStr}
                                                value={normalizeString(labelText)}
                                                className="cursor-pointer hover:bg-accent"
                                                onSelect={() => {
                                                    field.onChange(Number(valueStr));
                                                    onSelectItem?.(item);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        String(field.value) === valueStr
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {labelText}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
