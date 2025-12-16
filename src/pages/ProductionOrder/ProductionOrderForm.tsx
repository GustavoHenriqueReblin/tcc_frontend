import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import {
    productionOrderFormSchema,
    type ProductionOrderFormValues,
} from "@/schemas/production-order.schema";

import { ProductionOrderStatusEnum } from "@/types/enums";
import { productionOrderStatusLabels } from "@/types/global";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
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
    const [unitySimbol, setUnitySimbol] = useState<string | null>(null);
    const [recipe, setRecipe] = useState<Recipe | null>(recipeDefaultValues);
    const form = useForm<ProductionOrderFormValues>({
        resolver: zodResolver(productionOrderFormSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    if (isLoading) {
        return (
            <div className="rounded-md border bg-card text-card-foreground p-6">
                <Loading />
            </div>
        );
    }

    const { handleSubmit, control, formState, watch } = form;
    const status = watch("status");

    return (
        <div className="rounded-md border bg-card text-card-foreground p-6">
            <Form {...form}>
                <form
                    onSubmit={handleSubmit(
                        (values) => {
                            onSubmit(values);
                        },
                        (errors) => {
                            console.error("FORM ERRORS", errors);
                        }
                    )}
                >
                    <Section
                        title="Dados da ordem"
                        description="Código, produto e situação da ordem de produção."
                    >
                        <FieldsGrid cols={4}>
                            <TextField control={control} name="code" label="Código" autoFocus />

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
                                    status !== ProductionOrderStatusEnum.PLANNED
                                        ? "Início"
                                        : "Previsão de início"
                                }
                                type="date"
                                disabled={status !== ProductionOrderStatusEnum.PLANNED}
                            />
                            <TextField
                                control={control}
                                name="endDate"
                                label={
                                    status !== ProductionOrderStatusEnum.FINISHED
                                        ? "Previsão de fim"
                                        : "Fim"
                                }
                                type="date"
                                allowFutureDates
                            />
                        </FieldsGrid>

                        <FieldsGrid cols={4}>
                            <ComboboxQuery<
                                ProductionOrderFormValues,
                                {
                                    id: number;
                                    description: string;
                                    productId: number;
                                    product: {
                                        name: string;
                                        unity: { simbol: string };
                                    };
                                }
                            >
                                control={control}
                                name="recipeId"
                                label="Receitas"
                                endpoint="/recipes"
                                valueField="id"
                                labelField="description"
                                formatLabel={(e) => {
                                    return `${e.product.name} - ${e.description}`;
                                }}
                                onSelectItem={(e) => {
                                    const selectedRecipe = e as Recipe;

                                    setRecipe(selectedRecipe);
                                    setUnitySimbol(selectedRecipe.product.unity.simbol);

                                    form.setValue(
                                        "inputs",
                                        selectedRecipe.items.map((item) => ({
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

                            <TextField
                                control={control}
                                name="plannedQty"
                                label="Qtd. planejada"
                                type="number"
                                decimals={3}
                                suffix={unitySimbol ? " " + unitySimbol : undefined}
                            />

                            <TextField
                                control={control}
                                name="wasteQty"
                                label="Perda"
                                type="number"
                                decimals={3}
                                suffix={unitySimbol ? " " + unitySimbol : undefined}
                            />
                        </FieldsGrid>
                    </Section>

                    {recipe && (
                        <>
                            <div className="mt-6" />
                            <Section title="Itens" description="Materiais utilizados na receita">
                                {/* <div className="flex mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="inline-flex items-center gap-2 w-fit"
                                        onClick={openNewItem}
                                    >
                                        <PlusCircle className="size-4" />
                                        Adicionar item
                                    </Button>
                                </div> */}

                                {recipe.items.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum item adicionado.
                                    </p>
                                )}

                                <div className="flex flex-col gap-2">
                                    {form.watch("inputs")?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-md p-3 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {
                                                        recipe?.items.find(
                                                            (i) => i.productId === item.productId
                                                        )?.product.name
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Quantidade:{" "}
                                                    {item.quantity.toLocaleString("pt-BR")}{" "}
                                                    {
                                                        recipe?.items.find(
                                                            (i) => i.productId === item.productId
                                                        )?.product.unity.simbol
                                                    }
                                                </p>
                                            </div>

                                            {/* <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => openEditItem(index)}
                                                >
                                                    Editar
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            type="button"
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Excluir item?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação não pode ser desfeita.
                                                                Deseja realmente excluir este item
                                                                da receita?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>

                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">
                                                                Cancelar
                                                            </AlertDialogCancel>

                                                            <AlertDialogAction
                                                                className="bg-destructive cursor-pointer"
                                                                // onClick={() => removeItem(index)}
                                                            >
                                                                Confirmar exclusão
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div> */}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </>
                    )}

                    <div className="mt-6" />

                    <Section title="Observações" description="Anotações gerais sobre a ordem.">
                        <TextAreaField control={control} name="notes" label="Notas" />
                    </Section>

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
                    </FormFooterFloating>
                </form>
            </Form>
        </div>
    );
}

export const defaultProductionOrderFormValues: ProductionOrderFormValues = {
    code: "",
    recipeId: null,
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
