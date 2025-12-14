import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { Section, FieldsGrid, TextField, TextAreaField } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import { api } from "@/api/client";
import { buildApiError } from "@/utils/global";

import {
    purchaseEntrySchema,
    type PurchaseEntryFormValues,
} from "@/schemas/inbound/purchase.schema";
import { ApiResponse } from "@/types/global";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { OrderStatusEnum } from "@/types/enums";

type SupplierOption = {
    id: number;
    person?: {
        name?: string | null;
        legalName?: string | null;
    };
};

type WareHouseOption = {
    id: number;
    name: string;
};

type ProductOption = {
    id: number;
    name: string;
    unity: {
        simbol: string;
    };
};

const supplierLabel = (supplier: SupplierOption) => {
    return supplier.person?.name ?? supplier.person?.legalName ?? `Fornecedor #${supplier.id}`;
};

const toNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};

const buildDefaultValues = (): PurchaseEntryFormValues => ({
    ...defaultPurchaseEntryValues,
    items: defaultPurchaseEntryValues.items.map((item) => ({ ...item })),
});

export function PurchaseEntryForm() {
    const [unitySimbol, setUnitySimbol] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const form = useForm<PurchaseEntryFormValues>({
        resolver: zodResolver(purchaseEntrySchema),
        defaultValues: useMemo(() => buildDefaultValues(), []),
    });

    const itemsArray = useFieldArray({
        control: form.control,
        name: "items",
    });

    const mutation = useMutation({
        mutationFn: async (values: PurchaseEntryFormValues) => {
            const toastId = toast.loading("Registrando compra...");

            try {
                await api.post<ApiResponse<PurchaseOrder>>("/purchase-orders", {
                    supplierId: values.supplierId,
                    warehouseId: values.warehouseId,
                    code: values.code.trim(),
                    status: OrderStatusEnum.PENDING,
                    notes: toNullable(values.notes),
                    items: {
                        create: values.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitCost: item.unitCost,
                        })),
                        update: [],
                        delete: [],
                    },
                });

                toast.success("Compra registrada com sucesso.", { id: toastId });
            } catch (error) {
                toast.error("Falha ao registrar a compra.", { id: toastId });
                throw buildApiError(error, "Erro ao registrar compra.");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/products"],
                exact: false,
            });

            queryClient.invalidateQueries({
                queryKey: ["datatable", "/inventory-movement"],
                exact: false,
            });

            form.reset(buildDefaultValues());
        },
    });

    const { handleSubmit, control, formState } = form;

    const handleAddItem = () => {
        itemsArray.append({
            productId: 0,
            quantity: 1,
            unitCost: 0,
        });
    };

    const handleRemoveItem = (index: number) => {
        if (itemsArray.fields.length === 1) return;
        itemsArray.remove(index);
    };

    const submitLabel =
        mutation.isPending || formState.isSubmitting ? "Salvando..." : "Registrar compra";

    return (
        <div className="rounded-md border bg-card text-card-foreground p-6 space-y-6">
            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
                    <Section
                        title="Dados da compra"
                        description="Fornecedor, documento e observações da entrada."
                    >
                        <FieldsGrid cols={3}>
                            <ComboboxQuery<PurchaseEntryFormValues, SupplierOption>
                                control={control}
                                name="supplierId"
                                label="Fornecedor"
                                endpoint="/suppliers"
                                valueField="id"
                                labelField="id"
                                formatLabel={supplierLabel}
                            />

                            <ComboboxQuery<PurchaseEntryFormValues, WareHouseOption>
                                control={control}
                                name="warehouseId"
                                label="Depósito"
                                endpoint="/warehouses"
                                valueField="id"
                                labelField="id"
                                formatLabel={(item) => item.name}
                            />

                            <TextField control={control} name="code" label="Código / documento" />
                        </FieldsGrid>

                        <TextAreaField control={control} name="notes" label="Observações" />
                    </Section>

                    <div className="mt-8" />

                    <Section
                        title="Itens da compra"
                        description="Produtos, quantidades e valores unitários."
                    >
                        <div className="space-y-4">
                            {itemsArray.fields.map((field, index) => (
                                <div key={field.id} className="rounded-md border p-4 space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-medium">Item {index + 1}</p>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={itemsArray.fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remover
                                        </Button>
                                    </div>

                                    <FieldsGrid cols={3}>
                                        <ComboboxQuery<PurchaseEntryFormValues, ProductOption>
                                            control={control}
                                            name={`items.${index}.productId` as const}
                                            label="Produto"
                                            endpoint="/products"
                                            valueField="id"
                                            labelField="name"
                                            onSelectItem={(e) => {
                                                setUnitySimbol(e.unity.simbol);
                                            }}
                                        />

                                        <TextField
                                            control={control}
                                            name={`items.${index}.quantity` as const}
                                            label="Quantidade"
                                            type="number"
                                            decimals={3}
                                            suffix={unitySimbol && " " + unitySimbol}
                                        />

                                        <TextField
                                            control={control}
                                            name={`items.${index}.unitCost` as const}
                                            label="Custo unitário"
                                            type="number"
                                            decimals={3}
                                            prefix="R$ "
                                        />
                                    </FieldsGrid>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddItem}
                                className="gap-2"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Adicionar item
                            </Button>
                        </div>
                    </Section>

                    <div id="purchase-form-actions" className="flex justify-end gap-3 pt-6">
                        <Button
                            type="submit"
                            disabled={formState.isSubmitting || mutation.isPending}
                        >
                            {submitLabel}
                        </Button>
                    </div>

                    <FormFooterFloating targetId="purchase-form-actions" rightOffset={20}>
                        <Button
                            type="submit"
                            disabled={formState.isSubmitting || mutation.isPending}
                        >
                            {submitLabel}
                        </Button>
                    </FormFooterFloating>
                </form>
            </Form>
        </div>
    );
}

export const defaultPurchaseEntryValues: PurchaseEntryFormValues = {
    supplierId: null,
    warehouseId: null,
    code: "",
    notes: "",
    items: [
        {
            productId: null,
            quantity: 1,
            unitCost: 0,
        },
    ],
};
