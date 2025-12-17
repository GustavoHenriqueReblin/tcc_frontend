import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
    productionOrderFormSchema,
    ProductionOrderFormValues,
    ProductionOrderInputValues,
} from "@/schemas/production-order.schema";
import { ProductionOrderItemModal } from "./ProductionOrderItemModal";

import { ProductionOrderStatusEnum } from "@/types/enums";
import { productionOrderStatusLabels } from "@/types/global";
import { Recipe } from "@/types/recipe";
import { PlusCircle } from "lucide-react";

interface Props {
    defaultValues: ProductionOrderFormValues;
    onSubmit: (values: ProductionOrderFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function ProductionOrderForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const [unitySimbol, setUnitySimbol] = useState<string | null>(null);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    const form = useForm<ProductionOrderFormValues>({
        resolver: zodResolver(productionOrderFormSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const { control, handleSubmit, formState, watch } = form;
    const status = watch("status");
    const inputs = watch("inputs") ?? [];

    const handleAddItem = () => {
        setEditingItemIndex(null);
        setItemModalOpen(true);
    };

    const handleEditItem = (index: number) => {
        setEditingItemIndex(index);
        setItemModalOpen(true);
    };

    const handleDeleteItem = (index: number) => {
        const next = [...inputs];
        next.splice(index, 1);
        form.setValue("inputs", next);
    };

    const handleSaveItem = (data: ProductionOrderInputValues) => {
        const next = [...inputs];

        if (editingItemIndex !== null) {
            next[editingItemIndex] = {
                ...next[editingItemIndex],
                quantity: data.quantity,
                unitCost: data.unitCost ?? null,
            };
        } else {
            next.push(data);
        }

        form.setValue("inputs", next);
        setEditingItemIndex(null);
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

                                    setUnitySimbol(selected.product.unity.simbol);

                                    form.setValue(
                                        "inputs",
                                        selected.items.map((item) => ({
                                            productId: item.productId,
                                            quantity: Number(item.quantity),
                                            unitCost: null,

                                            productName: item.product.name,
                                            unitySimbol: item.product.unity.simbol,
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

                    {inputs.length > 0 && (
                        <>
                            <div className="mt-8"></div>
                            <Section
                                title="Insumos"
                                description="Materiais consumidos na produção."
                            >
                                <div className="flex mb-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddItem}
                                    >
                                        <PlusCircle className="size-4" />
                                        Adicionar insumo
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {inputs.map((item, index) => (
                                        <div
                                            key={`${item.productId}-${index}`}
                                            className="border rounded-md p-3 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-medium">{item.productName}</p>

                                                <p className="text-xs text-muted-foreground">
                                                    Quantidade:{" "}
                                                    {item.quantity.toLocaleString("pt-BR")}{" "}
                                                    {item.unitySimbol}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditItem(index)}
                                                >
                                                    Editar
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Excluir insumo?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação não pode ser desfeita.
                                                                Deseja realmente excluir este insumo
                                                                da ordem de produção?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>

                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel
                                                                className="cursor-pointer"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                Cancelar
                                                            </AlertDialogCancel>

                                                            <AlertDialogAction
                                                                className="bg-destructive cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteItem(index);
                                                                }}
                                                            >
                                                                Confirmar exclusão
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
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

            {itemModalOpen && (
                <ProductionOrderItemModal
                    open={itemModalOpen}
                    onClose={() => {
                        setItemModalOpen(false);
                        setEditingItemIndex(null);
                    }}
                    initialData={inputs[editingItemIndex]}
                    onSave={handleSaveItem}
                />
            )}
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
