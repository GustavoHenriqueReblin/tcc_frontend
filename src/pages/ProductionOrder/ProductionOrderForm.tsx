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
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatCurrency } from "@/utils/global";

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
    const plannedQty = watch("plannedQty") ?? 0;
    const otherCosts = watch("otherCosts") ?? 0;
    const totalRawMaterialCost = inputs.reduce((total, item) => {
        const itemCost = (item.unitCost ?? 0) * item.quantity;
        return total + itemCost;
    }, 0);

    const isMobile = useIsMobile();

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

    const renderFooter = () => {
        const rawMaterialCost = totalRawMaterialCost * (plannedQty || 0);
        const totalCost = rawMaterialCost + otherCosts;

        function TotalItem({
            label,
            value,
            align = "end",
        }: {
            label: string;
            value: number;
            align?: "start" | "end";
        }) {
            return (
                <div className="flex flex-col">
                    <span className={`text-sm text-${align}`}>{label}</span>
                    <span className={`text-sm font-medium text-${align}`}>
                        {formatCurrency(value)}
                    </span>
                </div>
            );
        }

        const Actions = (
            <div className="flex justify-end gap-3 pt-2">
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

        let totals = null;
        if (isMobile) {
            totals = (
                <div className="flex flex-col gap-4 w-full">
                    <TotalItem label="Custo matérias primas:" value={rawMaterialCost} />
                    <TotalItem label="Outros custos:" value={otherCosts} />
                    <TotalItem label="Custo total:" value={totalCost} />

                    {Actions}
                </div>
            );
        } else {
            totals = (
                <div className="flex justify-end items-start gap-10 pt-2">
                    <TotalItem label="Custo matérias primas:" value={rawMaterialCost} />
                    <span className="mt-3 text-sm">+</span>

                    <TotalItem label="Outros custos:" value={otherCosts} />
                    <span className="mt-3 text-sm">=</span>

                    <TotalItem label="Custo total:" value={totalCost} />
                    {Actions}
                </div>
            );
        }

        return (
            <>
                <div id="form-actions" className="flex justify-end gap-10 pt-4">
                    {totals}
                </div>

                <FormFooterFloating targetId="form-actions" rightOffset={20}>
                    {totals}
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
                                allowFutureDates
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
                                            unitCost: Number(
                                                item.product.productInventory[0].costValue ?? 0
                                            ),

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

                    <Section
                        title="Quantidades"
                        description="Quantidades e demais custos planejados."
                    >
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

                            <TextField
                                control={control}
                                name="otherCosts"
                                label="Outros custos"
                                type="number"
                                decimals={3}
                                prefix="R$ "
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

                                                <div className="flex gap-2 items-center">
                                                    <p className="text-xs text-muted-foreground">
                                                        Quantidade:{" "}
                                                        {item.quantity.toLocaleString("pt-BR")}{" "}
                                                        {item.unitySimbol}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        *
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        Custo unitário:{" R$ "}
                                                        {item.unitCost.toLocaleString("pt-BR")}{" "}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        =
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {"R$ " +
                                                            (
                                                                item.quantity * item.unitCost
                                                            ).toLocaleString("pt-BR")}{" "}
                                                    </p>
                                                </div>
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

                    {renderFooter()}
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
    otherCosts: 0,
    startDate: null,
    endDate: null,
    notes: "",
    inputs: [],
};
