import { ReactNode } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectBaseClass =
    "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

interface BaseFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
}

interface EnumSelectProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    enumObject: Record<string, string>;
    labels?: Record<string, string>;
    allowEmpty?: boolean;
}

export function TextField<T extends FieldValues>({
    control,
    name,
    label,
    type = "text",
    mask,
}: BaseFieldProps<T> & { type?: string; mask?: (v: string) => string }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
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
            )}
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

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    options: string[];
    allowEmpty?: boolean;
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
    const entries = Object.entries(enumObject) as [string, string][];

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
                            onChange={(e) => field.onChange(e.target.value || null)}
                        >
                            {allowEmpty && <option value="">Selecione</option>}

                            {entries.map(([key, value]) => (
                                <option key={value} value={value}>
                                    {labels?.[key] ?? value}
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
