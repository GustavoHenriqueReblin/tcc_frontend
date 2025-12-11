import { useEffect, useState } from "react";
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
import { ProductDefinition } from "@/types/product";
import { api } from "@/api/client";
import { ApiResponse, ServerList } from "@/types/global";
import { buildApiError } from "@/utils/global";
import { ProductDefinitionTypeEnum } from "@/types/enums";
import { SlidersHorizontal } from "lucide-react";

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
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues,
    });
    const queryClient = useQueryClient();

    const { data: productDefinitionsResponse } = useQuery<ProductDefinition[], Error>({
        queryKey: ["/product-definitions", {}],
        queryFn: async () => {
            try {
                const response =
                    await api.get<ApiResponse<ServerList<ProductDefinition>>>(
                        "/product-definitions"
                    );

                if (!response.data.success) {
                    throw new Error(
                        response.data.message || "Erro ao carregar definições do produto"
                    );
                }

                return response.data.data.items;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar definições do produto");
            }
        },
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [form, defaultValues]);

    const recipes = form.watch("recipes") ?? [];
    const idDefinition = form.watch("productDefinitionId");

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
                            <TextField control={control} name="name" label="Nome *" autoFocus />
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
                        <FieldsGrid cols={3}>
                            <TextField
                                control={control}
                                name="costValue"
                                label="Valor de custo"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                            />
                            <TextField
                                control={control}
                                name="saleValue"
                                label="Valor de venda"
                                type="number"
                                decimals={3}
                                prefix="R$ "
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

                    {productDefinitionsResponse?.find(
                        (pd) => pd.type === ProductDefinitionTypeEnum.FINISHED_PRODUCT
                    ).id === idDefinition && (
                        <ProductRecipes recipes={recipes} onChange={handleRecipesChange} />
                    )}

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
    quantity: 0,
    recipes: [],
};
