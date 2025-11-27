import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandItem,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

import { ApiResponse, ServerList } from "@/types/global";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { useState } from "react";

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

    disabled?: boolean;
    extraParams?: Record<string, unknown>;
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
    disabled = false,
    extraParams = {},
}: ComboboxQueryProps<TFieldValues, TItem>) {
    const [open, setOpen] = useState(false);

    const query = useQuery({
        queryKey: [endpoint, extraParams],
        enabled: !disabled,
        queryFn: async () => {
            const res = await api.get<ApiResponse<ServerList<TItem>>>(endpoint, {
                params: extraParams,
            });

            return res.data.data.items;
        },
    });

    const items = query.data ?? [];

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                    <FormLabel>{label}</FormLabel>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    role="combobox"
                                    className="justify-between"
                                >
                                    {field.value
                                        ? String(
                                              items.find(
                                                  (i) =>
                                                      String(i[valueField]) === String(field.value)
                                              )?.[labelField] ?? ""
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
                                        const value = String(item[valueField]);
                                        const labelText = String(item[labelField]);

                                        return (
                                            <CommandItem
                                                className="cursor-pointer hover:bg-accent"
                                                key={value}
                                                value={labelText}
                                                onSelect={() => {
                                                    field.onChange(Number(value));
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value == value
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
