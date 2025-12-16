import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";

import {
    productionOrderFormSchema,
    ProductionOrderFormValues,
} from "@/schemas/production-order.schema";

import { ProductionOrderStatusEnum } from "@/types/enums";
import { productionOrderStatusLabels } from "@/types/global";
import { Recipe } from "@/types/recipe";

interface Props {
    defaultValues: ProductionOrderFormValues;
    recipeDefaultValues?: Recipe | null;
    onSubmit: (values: ProductionOrderFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function ProductionOrderForm({
    defaultValues,
    recipeDefaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const [recipe, setRecipe] = useState<Recipe | null>(recipeDefaultValues);
    const [unitySimbol, setUnitySimbol] = useState<string | null>(null);

    const form = useForm<ProductionOrderFormValues>({
        resolver: zodResolver(productionOrderFormSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const { control, handleSubmit, formState, watch } = form;
    const status = watch("status");

    const recipeItemsMap = useMemo(() => {
        if (!recipe) return {};
        return Object.fromEntries(recipe.items.map((i) => [i.productId, i]));
    }, [recipe]);

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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Section
                        title="Identificação"
                        description="Código e situação da ordem de produção."
                    >
                        <FieldsGrid cols={4}>
                            <TextField control={control} name="code" label="Código *" autoFocus />

                            <EnumSelect
                                control={control}
                                name="status"
                                label="Status"
                                enumObject={ProductionOrderStatusEnum}
                                allowedValues={[
                                    ProductionOrderStatusEnum.PLANNED,
                                    ProductionOrderStatusEnum.RUNNING,
                                ]}
                                labels={productionOrderStatusLabels}
                            />

                            <TextField
                                control={control}
                                name="startDate"
                                label={
                                    status === ProductionOrderStatusEnum.PLANNED
                                        ? "Previsão de início"
                                        : "Início"
                                }
                                type="date"
                                disabled={status !== ProductionOrderStatusEnum.PLANNED}
                            />

                            <TextField
                                control={control}
                                name="endDate"
                                label="Previsão de fim"
                                type="date"
                                allowFutureDates
                            />
                        </FieldsGrid>
                    </Section>

                    <div className="mt-8"></div>

                    <Section title="Planejamento" description="Depósito, receita e lote.">
                        <FieldsGrid cols={4}>
                            <ComboboxQuery
                                control={control}
                                name="warehouseId"
                                label="Depósito *"
                                endpoint="/warehouses"
                                valueField="id"
                                labelField="name"
                            />

                            <ComboboxQuery<
                                ProductionOrderFormValues,
                                {
                                    id: number;
                                    description: string;
                                    product: {
                                        name: string;
                                        unity: { simbol: string };
                                    };
                                }
                            >
                                control={control}
                                name="recipeId"
                                label="Receita *"
                                endpoint="/recipes"
                                valueField="id"
                                labelField="description"
                                formatLabel={(e) => `${e.product.name} - ${e.description}`}
                                onSelectItem={(e) => {
                                    const selected = e as Recipe;

                                    setRecipe(selected);
                                    setUnitySimbol(selected.product.unity.simbol);

                                    form.setValue(
                                        "inputs",
                                        selected.items.map((item) => ({
                                            productId: item.productId,
                                            quantity: Number(item.quantity),
                                            unitCost: null,
                                        }))
                                    );
                                }}
                            />

                            <ComboboxQuery
                                control={control}
                                name="lotId"
                                label="Lote"
                                endpoint="/lots"
                                valueField="id"
                                labelField="code"
                            />
                        </FieldsGrid>
                    </Section>

                    <div className="mt-8"></div>

                    <Section title="Quantidades" description="">
                        <FieldsGrid cols={4}>
                            <TextField
                                control={control}
                                name="plannedQty"
                                label="Quantidade planejada *"
                                type="number"
                                decimals={3}
                                suffix={unitySimbol ?? undefined}
                            />

                            <TextField
                                control={control}
                                name="wasteQty"
                                label="Perda prevista"
                                type="number"
                                decimals={3}
                                suffix={unitySimbol ?? undefined}
                            />
                        </FieldsGrid>
                    </Section>

                    {recipe && (
                        <>
                            <div className="mt-8"></div>
                            <Section
                                title="Insumos"
                                description="Materiais consumidos na produção."
                            >
                                <div className="flex flex-col gap-2">
                                    {form.watch("inputs")?.map((item, index) => {
                                        const recipeItem = recipeItemsMap[item.productId];

                                        return (
                                            <div key={index} className="border rounded-md p-3">
                                                <p className="font-medium">
                                                    {recipeItem?.product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Quantidade:{" "}
                                                    {item.quantity.toLocaleString("pt-BR")}{" "}
                                                    {recipeItem?.product.unity.simbol}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Section>
                        </>
                    )}

                    <div className="mt-8"></div>
                    <Section title="Observações" description="">
                        <TextAreaField control={control} name="notes" label="Notas" />
                    </Section>

                    <div id="form-actions" className="flex justify-end gap-3 pt-4">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancelar
                            </Button>
                        )}

                        <Button type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? "Salvando..." : submitLabel}
                        </Button>
                    </div>

                    <FormFooterFloating targetId="form-actions" rightOffset={20}>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancelar
                            </Button>
                        )}

                        <Button type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? "Salvando..." : submitLabel}
                        </Button>
                    </FormFooterFloating>
                </form>
            </Form>
        </div>
    );
}

export const defaultProductionOrderFormValues: ProductionOrderFormValues = {
    code: "",
    recipeId: null,
    warehouseId: null,
    lotId: null,
    status: ProductionOrderStatusEnum.PLANNED,
    plannedQty: 0,
    producedQty: null,
    wasteQty: null,
    startDate: null,
    endDate: null,
    notes: "",
    inputs: [],
};
