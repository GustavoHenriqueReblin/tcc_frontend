import { ReactNode, useRef, useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import {
    Command,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandInput,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "./ui/calendar";

const selectBaseClass =
    "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

interface BaseFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    autoFocus?: boolean;
}

interface EnumSelectProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    enumObject: Record<string, string>;
    labels?: Record<string, string>;
    allowEmpty?: boolean;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    options: string[];
    allowEmpty?: boolean;
}

function DateField({
    label,
    field,
}: {
    label: string;
    field: { value: string | null; onChange: (v: string | null) => void };
}) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const fallbackText = field.value ? new Date(field.value).toLocaleDateString("pt-BR") : "";

    const displayed = text !== "" ? text : fallbackText;

    const handleInputChange = (raw: string) => {
        const digits = raw.replace(/\D/g, "").slice(0, 8);

        let formatted = digits;
        if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        if (digits.length > 4)
            formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

        setText(formatted);

        if (digits.length === 8) {
            const d = digits.slice(0, 2);
            const m = digits.slice(2, 4);
            const y = digits.slice(4);
            const parsed = new Date(`${y}-${m}-${d}`);

            if (!isNaN(parsed.getTime())) {
                field.onChange(parsed.toISOString().split("T")[0]);
                return;
            }
        }

        if (!digits) field.onChange(null);
    };

    return (
        <FormItem className="flex flex-col w-full">
            <FormLabel>{label}</FormLabel>

            <div className="flex gap-2">
                <FormControl>
                    <Input
                        ref={inputRef}
                        placeholder="dd/mm/aaaa"
                        value={displayed}
                        maxLength={10}
                        inputMode="numeric"
                        onFocus={() => {
                            setTimeout(() => {
                                setOpen(true);
                            }, 50);
                        }}
                        onClick={() => {
                            setTimeout(() => {
                                if (!open) setOpen(true);
                            }, 50);
                        }}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                </FormControl>

                <Popover open={open} onOpenChange={setOpen} modal={false}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" type="button">
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Calendar
                            mode="single"
                            locale={ptBR}
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(d) => {
                                if (d) {
                                    field.onChange(d.toISOString().split("T")[0]);
                                    setText("");
                                }
                                setOpen(false);
                            }}
                            disabled={(d) => d > new Date()}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <FormMessage />
        </FormItem>
    );
}

export function TextField<T extends FieldValues>({
    control,
    name,
    label,
    type = "text",
    mask,
    autoFocus,
}: BaseFieldProps<T> & { type?: string; mask?: (v: string) => string }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                if (type === "date") {
                    return <DateField label={label} field={field} />;
                }

                return (
                    <FormItem className="flex flex-col w-full">
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <Input
                                autoFocus={autoFocus}
                                {...field}
                                type={type}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                    field.onChange(mask ? mask(e.target.value) : e.target.value)
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}

export function NumberField<T extends FieldValues>({ control, name, label }: BaseFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function TextAreaField<T extends FieldValues>({ control, name, label }: BaseFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function SelectField<T extends FieldValues>({
    control,
    name,
    label,
    options,
    allowEmpty = false,
}: SelectFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <select
                            className={selectBaseClass}
                            value={field.value ?? ""}
                            onChange={(e) =>
                                field.onChange(e.target.value || (allowEmpty ? null : ""))
                            }
                        >
                            {allowEmpty && <option value="">Selecione</option>}
                            {options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function EnumSelect<T extends FieldValues>({
    control,
    name,
    label,
    enumObject,
    labels,
    allowEmpty = false,
}: EnumSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const entries = Object.entries(enumObject) as [string, string][];

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const selectedEntry = entries.find(([, value]) => value === field.value);
                const selectedKey = selectedEntry?.[0];
                const selectedValue = selectedEntry?.[1];
                const selectedLabel = labels?.[selectedKey ?? ""] ?? selectedValue;

                return (
                    <FormItem className="flex flex-col w-full">
                        <FormLabel>{label}</FormLabel>

                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        className="justify-between"
                                    >
                                        {field.value ? selectedLabel : "Selecione..."}

                                        <ChevronsUpDown className="opacity-50 size-4" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>

                            <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                                <Command>
                                    <CommandInput placeholder="Buscar..." />
                                    <CommandList>
                                        {allowEmpty && (
                                            <CommandItem
                                                value=""
                                                onSelect={() => {
                                                    field.onChange(null);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 size-4",
                                                        !field.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                (Nenhum)
                                            </CommandItem>
                                        )}

                                        <CommandEmpty>Nenhum item encontrado.</CommandEmpty>

                                        {entries.map(([key, value]) => {
                                            const labelText = labels?.[key] ?? value;

                                            return (
                                                <CommandItem
                                                    className="cursor-pointer hover:bg-accent"
                                                    key={value}
                                                    value={labelText}
                                                    onSelect={() => {
                                                        field.onChange(value);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 size-4",
                                                            field.value === value
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
                );
            }}
        />
    );
}

export function FieldsGrid({ cols, children }: { cols: number; children: ReactNode }) {
    return (
        <div
            className={cn(
                "grid gap-4 items-start",
                cols === 1 && "md:grid-cols-1",
                cols === 2 && "md:grid-cols-2",
                cols === 3 && "md:grid-cols-3",
                cols === 4 && "md:grid-cols-4"
            )}
        >
            {children}
        </div>
    );
}

export function Section({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}
