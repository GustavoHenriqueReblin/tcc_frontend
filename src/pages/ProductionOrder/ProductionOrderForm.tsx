import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import {
    productionOrderFormSchema,
    type ProductionOrderFormValues,
} from "@/schemas/productionOrder.schema";

import { ProductionOrderStatusEnum } from "@/types/enums";
import { productionOrderStatusLabels } from "@/types/global";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";

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

    const { handleSubmit, control, formState } = form;

    return (
        <div className="rounded-md border bg-card text-card-foreground p-6">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                                labels={productionOrderStatusLabels}
                            />

                            <TextField
                                control={control}
                                name="startDate"
                                label="Início"
                                type="date"
                            />
                            <TextField
                                control={control}
                                name="endDate"
                                label="Fim"
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
                                name="productId"
                                label="Receitas"
                                endpoint="/recipes"
                                valueField="productId"
                                labelField="description"
                                formatLabel={(e) => {
                                    return `${e.product.name} - ${e.description}`;
                                }}
                                onSelectItem={(e) => {
                                    setUnitySimbol(e.product.unity.simbol);
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
    productId: null,
    lotId: null,
    status: ProductionOrderStatusEnum.PLANNED,

    plannedQty: 0,
    // producedQty: null,
    wasteQty: null,

    startDate: null,
    endDate: null,
    notes: "",
};
