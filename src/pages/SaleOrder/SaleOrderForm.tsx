import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { Loading } from "@/components/Loading";

import {
    saleOrderFormSchema,
    type SaleOrderFormValues,
    type SaleOrderItemFormValues,
} from "@/schemas/sale-order.schema";
import { OrderStatusEnum } from "@/types/enums";
import { ApiResponse, ServerList, orderStatusLabels } from "@/types/global";
import { SaleOrder } from "@/types/saleOrder";
import { api } from "@/api/client";
import { buildApiError, formatCurrency, round3 } from "@/utils/global";
import { useIsMobile } from "@/hooks/useIsMobile";

type CustomerOption = {
    id: number;
    person?: {
        name?: string | null;
        legalName?: string | null;
    };
};

type ProductOption = {
    id: number;
    name: string;
    unity?: { simbol: string };
    productInventory?: { saleValue: number; costValue: number; quantity?: number | string }[];
};

type WareHouseOption = {
    id: number;
    name: string;
};

type SaleOrderFormSubmit = (
    values: SaleOrderFormValues,
    context: { removedItemIds: number[] }
) => Promise<void> | void;

interface Props {
    defaultValues: SaleOrderFormValues;
    onSubmit: SaleOrderFormSubmit;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

const customerLabel = (customer: CustomerOption) =>
    customer.person?.name ?? customer.person?.legalName ?? `Cliente #${customer.id}`;

const defaultItem: SaleOrderItemFormValues = {
    productId: null,
    quantity: 1,
    unitPrice: 0,
    productUnitPrice: 0,
    unitCost: 0,
    inventoryQuantity: 0,
};

export function SaleOrderForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const isMobile = useIsMobile();
    const [removedItemIds, setRemovedItemIds] = useState<number[]>([]);
    const [codeLocked, setCodeLocked] = useState<boolean>(!!defaultValues.code);

    const form = useForm<SaleOrderFormValues>({
        resolver: zodResolver(saleOrderFormSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
        setRemovedItemIds([]);
        setCodeLocked(!!defaultValues.code);
    }, [defaultValues, form]);

    const { control, handleSubmit, formState, watch, setValue, getValues } = form;
    const code = watch("code");

    const itemsArray = useFieldArray({
        control,
        name: "items",
        keyName: "fieldId",
    });

    const items = watch("items") ?? [];
    const discount = watch("discount") ?? 0;
    const otherCosts = watch("otherCosts") ?? 0;

    const subtotal = round3(
        items.reduce((sum, item) => {
            const qty = Number(item.quantity ?? 0);
            const baseUnit = Number(item.productUnitPrice ?? 0);
            return sum + qty * baseUnit;
        }, 0)
    );

    const total = round3(Math.max(subtotal - discount + otherCosts, 0));

    const { data: lastSaleOrder, isLoading: lastOrderIsLoading } = useQuery<SaleOrder | null>({
        enabled: !code,
        queryKey: ["sale-order-last", code],
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<ServerList<SaleOrder>>>("/sale-orders", {
                    params: {
                        page: 1,
                        limit: 1,
                        sortBy: "createdAt",
                        sortOrder: "desc",
                    },
                });

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar venda");
                }

                return response.data.data.items[0] ?? null;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar última venda");
            }
        },
    });

    useEffect(() => {
        if (code) return;

        if (!lastSaleOrder && !lastOrderIsLoading) {
            setValue("code", "1", { shouldDirty: true, shouldValidate: true });
            setCodeLocked(true);
            return;
        }

        const lastCode = Number(lastSaleOrder?.code);
        if (!Number.isNaN(lastCode)) {
            setValue("code", String(lastCode + 1), {
                shouldDirty: true,
                shouldValidate: true,
            });
            setCodeLocked(true);
        }
    }, [code, lastSaleOrder, lastOrderIsLoading, setValue]);

    const recalcItemPriceAdjustments = () => {
        const currentItems = getValues("items") ?? [];

        let nextDiscount = 0;
        let nextOtherCosts = 0;

        currentItems.forEach((item) => {
            const qty = Number(item?.quantity ?? 0);
            const unitPrice = Number(item?.unitPrice ?? 0);
            const productUnitPrice = Number(item?.productUnitPrice ?? 0);

            if (qty <= 0 || productUnitPrice <= 0) return;

            const diff = round3((unitPrice - productUnitPrice) * qty);

            if (diff > 0) {
                nextOtherCosts = round3(nextOtherCosts + diff);
            } else if (diff < 0) {
                nextDiscount = round3(nextDiscount + Math.abs(diff));
            }
        });

        setValue("discount", round3(nextDiscount), {
            shouldDirty: true,
            shouldValidate: true,
        });

        setValue("otherCosts", round3(nextOtherCosts), {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const distributeAdjustmentsToItems = () => {
        const currentItems = getValues("items") ?? [];
        const discount = Number(getValues("discount") ?? 0);
        const otherCosts = Number(getValues("otherCosts") ?? 0);

        const baseSubtotal = currentItems.reduce((sum, item) => {
            const qty = Number(item?.quantity ?? 0);
            const baseUnit = Number(item?.productUnitPrice ?? 0);
            return sum + round3(qty * baseUnit);
        }, 0);

        if (baseSubtotal <= 0) return;

        currentItems.forEach((item, idx) => {
            const qty = Number(item?.quantity ?? 0);
            const baseUnit = Number(item?.productUnitPrice ?? 0);

            if (qty <= 0 || baseUnit <= 0) return;

            const baseItemTotal = round3(qty * baseUnit);
            const ratio = baseItemTotal / baseSubtotal;

            const itemDiscount = round3(discount * ratio);
            const itemOtherCost = round3(otherCosts * ratio);

            const adjustedTotal = round3(baseItemTotal - itemDiscount + itemOtherCost);

            const adjustedUnit = round3(adjustedTotal / qty);

            setValue(`items.${idx}.unitPrice`, adjustedUnit, {
                shouldDirty: true,
                shouldValidate: true,
            });
        });
    };

    const handleAddItem = () => {
        itemsArray.append({ ...defaultItem });
    };

    const handleRemoveItem = (index: number) => {
        const item = itemsArray.fields[index];
        if (item?.id) {
            setRemovedItemIds((prev) =>
                prev.includes(Number(item.id)) ? prev : [...prev, Number(item.id)]
            );
        }

        if (itemsArray.fields.length > 1) {
            itemsArray.remove(index);
            recalcItemPriceAdjustments();
        }
    };

    const renderFooter = () => {
        const totals = (
            <div className="rounded-md">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(total)}</p>
                <p className="text-xs text-muted-foreground">
                    Subtotal: {formatCurrency(subtotal)} | Desconto: {formatCurrency(discount)} |
                    Outros: {formatCurrency(otherCosts)}
                </p>
            </div>
        );

        const actions = (
            <div className="flex gap-3">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={formState.isSubmitting}>
                    {formState.isSubmitting ? "Salvando..." : submitLabel}
                </Button>
            </div>
        );

        const content = isMobile ? (
            <div className="flex flex-col gap-4 w-full items-end">
                {totals}
                {actions}
            </div>
        ) : (
            <div className="flex items-center justify-end gap-8">
                {totals}
                {actions}
            </div>
        );

        return (
            <>
                <div id="sale-order-form-actions" className="pt-4">
                    {content}
                </div>

                <FormFooterFloating targetId="sale-order-form-actions" rightOffset={20}>
                    {content}
                </FormFooterFloating>
            </>
        );
    };

    if (isLoading) {
        return (
            <div className="rounded-md border bg-card p-6">
                <Loading />
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card p-6">
            <Form {...form}>
                <form
                    onSubmit={handleSubmit(
                        (values) => onSubmit(values, { removedItemIds }),
                        (errors) => {
                            console.error("FORM ERRORS", errors);
                            console.log("CURRENT VALUES", form.getValues());
                        }
                    )}
                    className="space-y-8"
                >
                    <Section
                        title="Identificação"
                        description="Código, cliente, depósito e status da venda."
                    >
                        <FieldsGrid cols={4}>
                            <TextField
                                control={control}
                                name="code"
                                label="Código"
                                disabled={codeLocked}
                            />

                            <ComboboxQuery<SaleOrderFormValues, CustomerOption>
                                control={control}
                                name="customerId"
                                label="Cliente *"
                                endpoint="/customers"
                                valueField="id"
                                labelField="id"
                                formatLabel={customerLabel}
                            />

                            <ComboboxQuery<SaleOrderFormValues, WareHouseOption>
                                control={control}
                                name="warehouseId"
                                label="Depósito *"
                                endpoint="/warehouses"
                                valueField="id"
                                labelField="id"
                                formatLabel={(w) => w.name}
                            />

                            <EnumSelect
                                control={control}
                                name="status"
                                label="Status"
                                enumObject={OrderStatusEnum}
                                labels={orderStatusLabels}
                            />
                        </FieldsGrid>
                    </Section>

                    <Section title="Itens da venda" description="Produtos, quantidades e valores.">
                        <div className="space-y-4">
                            {itemsArray.fields.map((field, index) => {
                                const unity = watch(`items.${index}.unitySimbol`);
                                const qty = watch(`items.${index}.quantity`) ?? 0;
                                const price = watch(`items.${index}.unitPrice`) ?? 0;
                                const productId = watch(`items.${index}.productId`) ?? 0;
                                const productUnitPrice =
                                    watch(`items.${index}.productUnitPrice`) ?? 0;
                                const inventoryQty =
                                    watch(`items.${index}.inventoryQuantity`) ?? null;

                                return (
                                    <div
                                        key={field.fieldId}
                                        className="rounded-md border p-4 space-y-4"
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium">Item {index + 1}</p>

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={itemsArray.fields.length === 1}
                                            >
                                                <Trash2 className="size-4" />
                                                Remover
                                            </Button>
                                        </div>

                                        <FieldsGrid cols={3}>
                                            <ComboboxQuery<SaleOrderFormValues, ProductOption>
                                                control={control}
                                                name={`items.${index}.productId` as const}
                                                label="Produto *"
                                                endpoint="/products"
                                                valueField="id"
                                                labelField="name"
                                                onSelectItem={(product) => {
                                                    setValue(
                                                        `items.${index}.unitySimbol`,
                                                        product.unity?.simbol ?? ""
                                                    );
                                                    setValue(
                                                        `items.${index}.inventoryQuantity`,
                                                        Number(
                                                            product.productInventory?.[0]
                                                                ?.quantity ?? 0
                                                        )
                                                    );
                                                    setValue(
                                                        `items.${index}.productName`,
                                                        product.name
                                                    );
                                                    setValue(
                                                        `items.${index}.productUnitPrice`,
                                                        Number(
                                                            product.productInventory?.[0]
                                                                ?.saleValue ?? 0
                                                        )
                                                    );

                                                    const inv = product.productInventory?.[0];
                                                    if (inv?.saleValue != null) {
                                                        setValue(
                                                            `items.${index}.unitPrice`,
                                                            Number(inv.saleValue)
                                                        );
                                                    }
                                                    if (inv?.costValue != null) {
                                                        setValue(
                                                            `items.${index}.unitCost`,
                                                            Number(inv.costValue)
                                                        );
                                                    }
                                                    recalcItemPriceAdjustments();
                                                }}
                                            />

                                            <TextField
                                                control={control}
                                                name={`items.${index}.quantity` as const}
                                                label="Quantidade"
                                                type="number"
                                                decimals={3}
                                                suffix={unity && ` ${unity}`}
                                                onBlur={() => recalcItemPriceAdjustments()}
                                            />

                                            <TextField
                                                control={control}
                                                name={`items.${index}.unitPrice` as const}
                                                label="Valor unitário"
                                                type="number"
                                                decimals={3}
                                                prefix="R$ "
                                                onBlur={() => recalcItemPriceAdjustments()}
                                            />
                                        </FieldsGrid>

                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <span>
                                                    Total do item:{" "}
                                                    <strong>{formatCurrency(qty * price)}</strong>
                                                </span>
                                                {productUnitPrice !== price && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Valor unit. do produto:{" "}
                                                        <strong>
                                                            {formatCurrency(productUnitPrice)}
                                                        </strong>
                                                    </div>
                                                )}
                                                {typeof inventoryQty === "number" &&
                                                    inventoryQty <= 0 &&
                                                    !!productId && (
                                                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                                            <AlertTriangle className="size-4" />{" "}
                                                            Atenção, saldo crítico:{" "}
                                                            <>{inventoryQty + " " + unity}</>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddItem}
                                className="gap-2"
                            >
                                <PlusCircle className="size-4" />
                                Adicionar item
                            </Button>
                        </div>
                    </Section>

                    <Section
                        title="Resumo e ajustes"
                        description="Descontos, custos adicionais e observações."
                    >
                        <FieldsGrid cols={3}>
                            <TextField
                                control={control}
                                name="discount"
                                label="Desconto"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                                onBlur={distributeAdjustmentsToItems}
                            />

                            <TextField
                                control={control}
                                name="otherCosts"
                                label="Outros custos"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                                onBlur={distributeAdjustmentsToItems}
                            />
                        </FieldsGrid>

                        <TextAreaField control={control} name="notes" label="Observações" />
                    </Section>

                    {renderFooter()}
                </form>
            </Form>
        </div>
    );
}

export const defaultSaleOrderFormValues: SaleOrderFormValues = {
    customerId: null,
    warehouseId: null,
    code: "",
    status: OrderStatusEnum.PENDING,
    discount: 0,
    otherCosts: 0,
    notes: "",
    items: [
        {
            productId: null,
            quantity: 0,
            productUnitPrice: 0,
            unitCost: 0,
            unitPrice: 0,
            inventoryQuantity: 0,
        },
    ],
};
