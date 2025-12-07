import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import { productFormSchema, type ProductFormValues } from "@/schemas/product.schema";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { AdjustStockModal } from "@/components/AdjustStockModal";
import { useQueryClient } from "@tanstack/react-query";

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

    useEffect(() => {
        form.reset(defaultValues);
    }, [form, defaultValues]);

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
                        <div className="flex justify-end items-center mb-2">
                            {Id && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setAdjustModalOpen(true)}
                                >
                                    Ajustar estoque
                                </Button>
                            )}
                        </div>

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
                            <TextField
                                control={control}
                                name="quantity"
                                label="Quantidade"
                                type="number"
                                disabled={!!Id}
                                decimals={3}
                            />
                        </FieldsGrid>
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

            {Id && (
                <AdjustStockModal
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
};
