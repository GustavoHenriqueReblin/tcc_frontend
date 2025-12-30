import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import {
    productFormSchema,
    type ProductFormValues,
    type RecipeFormValue,
} from "@/schemas/product.schema";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { AdjustInventoryModal } from "@/pages/Product/AdjustInventory/AdjustInventoryModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductRecipes } from "./Recipe/ProductRecipes";
import { SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSearchParams } from "react-router-dom";
import { ApiResponse, ProductDefinitionType, ServerList } from "@/types/global";
import { ProductDefinition } from "@/types/product";
import { api } from "@/api/client";

interface Props {
    defaultValues: ProductFormValues;
    onSubmit: (values: ProductFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
    Id?: number;
}

export function ProductForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
    Id,
}: Props) {
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [profitMarginEdited, setProfitMarginEdited] = useState(false);
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues,
    });
    const queryClient = useQueryClient();
    const isMobile = useIsMobile();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type") as ProductDefinitionType;

    useQuery<ProductDefinition>({
        queryKey: ["product-definition", type],
        enabled: !form.getValues("productDefinitionId") && !!type,
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<ProductDefinition>>>(
                "/product-definitions",
                {
                    params: {
                        type: type,
                        limit: 1,
                    },
                }
            );

            if (!response.data.success || response.data.data.items.length === 0) {
                throw new Error("Definição de matéria-prima não encontrada");
            }

            const id = response.data.data.items[0].id;
            if (id) form.setValue("productDefinitionId", id);
            return response.data.data.items[0];
        },
    });

    useEffect(() => {
        form.reset(defaultValues);
        setProfitMarginEdited(false);
    }, [form, defaultValues]);

    const updateSaleValueFromMargin = useCallback(
        (margin?: number | null, cost?: number | null) => {
            if (margin === null || margin === undefined || Number.isNaN(margin)) return;
            if (cost === null || cost === undefined || Number.isNaN(cost)) return;

            const sale = cost * (1 + margin / 100);

            if (!Number.isFinite(sale)) return;

            const normalizedSale = Number(sale.toFixed(3));

            if (normalizedSale === form.getValues("saleValue")) return;

            form.setValue("saleValue", normalizedSale, { shouldDirty: true });
        },
        [form]
    );

    const updateMarginFromValues = useCallback(() => {
        const cost = form.getValues("costValue");
        const sale = form.getValues("saleValue");

        if (cost === null || cost === undefined || Number.isNaN(cost) || cost === 0) {
            form.setValue("profitMargin", 0);
            return;
        }

        if (sale === null || sale === undefined || Number.isNaN(sale) || sale <= 0) {
            form.setValue("profitMargin", 0);
            return;
        }

        const margin = ((sale - cost) / cost) * 100;
        const normalizedMargin = Number.isFinite(margin) ? Number(margin.toFixed(2)) : 0;

        form.setValue("profitMargin", normalizedMargin);
    }, [form]);

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "profitMargin") {
                const isDirty = form.getFieldState("profitMargin").isDirty;

                if (isDirty) {
                    setProfitMarginEdited(true);
                    updateSaleValueFromMargin(
                        value?.profitMargin as number | null,
                        value?.costValue as number | null
                    );
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form, updateSaleValueFromMargin]);

    const costValue = form.watch("costValue");

    useEffect(() => {
        if (!profitMarginEdited) return;

        updateSaleValueFromMargin(form.getValues("profitMargin"), costValue);
    }, [costValue, profitMarginEdited, form, updateSaleValueFromMargin]);

    const recipes = form.watch("recipes") ?? [];

    const handleRecipesChange = (nextRecipes: RecipeFormValue[]) => {
        form.setValue("recipes", nextRecipes, { shouldDirty: true });
    };

    if (isLoading) {
        return (
            <div className="rounded-md border bg-card text-card-foreground p-6">
                <Loading />
            </div>
        );
    }

    const { handleSubmit, control, formState } = form;

    return (
        <div className="rounded-md border bg-card text-card-foreground p-6">
            <Form {...form}>
                <form id="form-product" onSubmit={handleSubmit(onSubmit)}>
                    <Section
                        title="Dados do produto"
                        description="Informações gerais do produto e vinculações."
                    >
                        <FieldsGrid cols={2}>
                            <TextField
                                control={control}
                                name="name"
                                label="Nome *"
                                autoFocus={!isMobile}
                            />
                            <TextField control={control} name="barcode" label="Código de barras" />
                        </FieldsGrid>

                        <FieldsGrid cols={2}>
                            <ComboboxQuery
                                control={control}
                                name="productDefinitionId"
                                label="Definição de produto *"
                                endpoint="/product-definitions"
                                valueField="id"
                                labelField="name"
                            />

                            <ComboboxQuery
                                control={control}
                                name="unityId"
                                label="Unidade *"
                                endpoint="/unities"
                                valueField="id"
                                labelField="simbol"
                            />
                        </FieldsGrid>
                    </Section>

                    <div className="mt-8" />

                    <Section
                        title="Estoque e precificação"
                        description="Valores de entrada, venda e saldo inicial."
                    >
                        <FieldsGrid cols={4}>
                            <TextField
                                control={control}
                                name="costValue"
                                label="Valor de custo"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                                onBlur={updateMarginFromValues}
                            />
                            <TextField
                                control={control}
                                name="profitMargin"
                                label="Margem de lucro (%)"
                                type="number"
                                decimals={2}
                                suffix="%"
                            />
                            <TextField
                                control={control}
                                name="saleValue"
                                label="Valor de venda"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                                onBlur={updateMarginFromValues}
                            />
                            <div className="flex items-end gap-4">
                                <TextField
                                    control={control}
                                    name="quantity"
                                    label="Quantidade"
                                    type="number"
                                    disabled={!!Id}
                                    decimals={3}
                                />
                                {Id && (
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="inline-flex items-center gap-2 w-fit"
                                        onClick={() => setAdjustModalOpen(true)}
                                    >
                                        <SlidersHorizontal className="size-4" />
                                        Ajustar estoque
                                    </Button>
                                )}
                            </div>
                        </FieldsGrid>
                    </Section>

                    <div className="mt-8" />
                    <ProductRecipes recipes={recipes} onChange={handleRecipesChange} />

                    <div id="form-actions" className="flex justify-end gap-3 pt-4">
                        {onCancel && (
                            <Button
                                tabIndex={-1}
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? "Salvando..." : submitLabel}
                        </Button>
                    </div>

                    <FormFooterFloating targetId="form-actions" rightOffset={20}>
                        {onCancel && (
                            <Button
                                form="form-product"
                                tabIndex={-1}
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button form="form-product" type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? "Salvando..." : submitLabel}
                        </Button>
                    </FormFooterFloating>
                </form>
            </Form>

            {Id && (
                <AdjustInventoryModal
                    open={adjustModalOpen}
                    onClose={() => setAdjustModalOpen(false)}
                    productData={{
                        id: Id,
                        quantity: form.getValues("quantity"),
                    }}
                    onSuccess={(newQuantity) => {
                        form.setValue("quantity", newQuantity);

                        queryClient.invalidateQueries({
                            queryKey: ["datatable", "/products"],
                            exact: false,
                        });
                    }}
                />
            )}
        </div>
    );
}

export const defaultProductFormValues: ProductFormValues = {
    name: "",
    barcode: "",
    productDefinitionId: 0,
    unityId: 0,

    costValue: 0,
    saleValue: 0,
    profitMargin: 0,
    quantity: 0,
    recipes: [],
};
