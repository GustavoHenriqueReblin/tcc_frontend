import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { Section, FieldsGrid, TextField, TextAreaField } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import { api } from "@/api/client";
import { buildApiError } from "@/utils/global";

import {
    adjustmentEntrySchema,
    type AdjustmentEntryFormValues,
} from "@/schemas/inbound/adjustment.schema";
import { ApiResponse } from "@/types/global";
import { InventoryMovement } from "@/types/inventoryMovement";
import { useState } from "react";

export function AdjustmentEntryForm() {
    const [unitySimbol, setUnitySimbol] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<AdjustmentEntryFormValues>({
        resolver: zodResolver(adjustmentEntrySchema),
        defaultValues: defaultAdjustmentEntryValues,
    });

    const mutation = useMutation({
        mutationFn: async (values: AdjustmentEntryFormValues) => {
            const toastId = toast.loading("Registrando ajuste...");

            try {
                const { productId, quantity, warehouseId, notes } = values;
                await api.post<ApiResponse<InventoryMovement>>("/inventory-movement/adjustments", {
                    productId,
                    quantity,
                    warehouseId,
                    notes: notes.trim() || null,
                });

                setUnitySimbol(null);
                toast.success("Ajuste registrado com sucesso.", { id: toastId });
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao registrar o ajuste.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao registrar ajuste de estoque.");
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

            form.reset(defaultAdjustmentEntryValues);
        },
    });

    const { handleSubmit, control, formState } = form;
    const submitLabel =
        mutation.isPending || formState.isSubmitting ? "Salvando..." : "Registrar ajuste";

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
                        title="Dados do ajuste"
                        description="Informe produto, depósito e quantidade para corrigir o saldo."
                    >
                        <FieldsGrid cols={3}>
                            <ComboboxQuery<
                                AdjustmentEntryFormValues,
                                {
                                    id: number;
                                    name: string;
                                    unity: {
                                        simbol: string;
                                    };
                                }
                            >
                                control={control}
                                name="productId"
                                label="Produto"
                                endpoint="/products"
                                valueField="id"
                                labelField="name"
                                onSelectItem={(e) => {
                                    setUnitySimbol(e.unity.simbol);
                                }}
                            />

                            <ComboboxQuery<
                                AdjustmentEntryFormValues,
                                {
                                    id: number;
                                    name: string;
                                }
                            >
                                control={control}
                                name="warehouseId"
                                label="Depósito"
                                endpoint="/warehouses"
                                valueField="id"
                                labelField="name"
                            />

                            <TextField
                                control={control}
                                name="quantity"
                                label="Quantidade"
                                type="number"
                                decimals={3}
                                suffix={unitySimbol && " " + unitySimbol}
                            />
                        </FieldsGrid>

                        <TextAreaField control={control} name="notes" label="Observações" />
                    </Section>

                    <div id="adjustment-form-actions" className="flex justify-end gap-3 pt-6">
                        <Button
                            type="submit"
                            disabled={formState.isSubmitting || mutation.isPending}
                        >
                            {submitLabel}
                        </Button>
                    </div>

                    <FormFooterFloating targetId="adjustment-form-actions" rightOffset={20}>
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

export const defaultAdjustmentEntryValues: AdjustmentEntryFormValues = {
    productId: null,
    warehouseId: null,
    quantity: 0,
    notes: "",
};
