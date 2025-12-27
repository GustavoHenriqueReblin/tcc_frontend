import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { Section, FieldsGrid, TextField, TextAreaField } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import { api } from "@/api/client";
import { buildApiError } from "@/utils/global";

import { harvestSchema, type HarvestFormValues } from "@/schemas/inbound/harvest.schema";
import { ApiResponse, ServerList } from "@/types/global";
import { InventoryMovement } from "@/types/inventoryMovement";
import { useState } from "react";
import { ProductDefinition } from "@/types/product";
import { ProductDefinitionTypeEnum } from "@/types/enums";

export function HarvestForm() {
    const [unitySimbol, setUnitySimbol] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<HarvestFormValues>({
        resolver: zodResolver(harvestSchema),
        defaultValues: defaultHarvestValues,
    });

    const { data: rawMaterialDefinition } = useQuery<ProductDefinition>({
        queryKey: ["product-definition", ProductDefinitionTypeEnum.RAW_MATERIAL],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<ProductDefinition>>>(
                "/product-definitions",
                {
                    params: {
                        type: ProductDefinitionTypeEnum.RAW_MATERIAL,
                        limit: 1,
                    },
                }
            );

            if (!response.data.success || response.data.data.items.length === 0) {
                throw new Error("Definição de matéria-prima não encontrada");
            }

            return response.data.data.items[0];
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: HarvestFormValues) => {
            const toastId = toast.loading("Registrando colheita...");

            try {
                const { productId, quantity, unitCost, warehouseId, notes } = values;
                await api.post<ApiResponse<InventoryMovement>>("/inventory-movement/harvest", {
                    productId,
                    quantity,
                    unitCost,
                    warehouseId,
                    notes: notes.trim() || null,
                });

                setUnitySimbol(null);
                toast.success("Colheita registrado com sucesso.", { id: toastId });
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao registrar a colheita.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao registrar a colheita.");
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

            form.reset(defaultHarvestValues);
        },
    });

    const { handleSubmit, control, formState } = form;
    const submitLabel =
        mutation.isPending || formState.isSubmitting ? "Salvando..." : "Registrar colheita";

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
                        title="Dados da colheita"
                        description="Informe produto, depósito e quantidade para dar entrada no estoque."
                    >
                        <FieldsGrid cols={4}>
                            <ComboboxQuery<
                                HarvestFormValues,
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
                                extraParams={
                                    rawMaterialDefinition
                                        ? { productDefinitionId: rawMaterialDefinition.id }
                                        : undefined
                                }
                                valueField="id"
                                labelField="name"
                                onSelectItem={(e) => {
                                    setUnitySimbol(e.unity.simbol);
                                }}
                            />

                            <ComboboxQuery<
                                HarvestFormValues,
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

                            <TextField
                                control={control}
                                name={`unitCost`}
                                label="Custo unitário"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                            />
                        </FieldsGrid>

                        <TextAreaField control={control} name="notes" label="Observações" />
                    </Section>

                    <div id="harvest-form-actions" className="flex justify-end gap-3 pt-6">
                        <Button
                            type="submit"
                            disabled={formState.isSubmitting || mutation.isPending}
                        >
                            {submitLabel}
                        </Button>
                    </div>

                    <FormFooterFloating targetId="harvest-form-actions" rightOffset={20}>
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

export const defaultHarvestValues: HarvestFormValues = {
    productId: null,
    warehouseId: null,
    quantity: 0,
    unitCost: 0,
    notes: "",
};
