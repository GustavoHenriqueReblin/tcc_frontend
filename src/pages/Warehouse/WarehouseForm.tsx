import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField } from "@/components/Fields";

import { warehouseFormSchema, type WarehouseFormValues } from "@/schemas/warehouse.schema";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
    defaultValues: WarehouseFormValues;
    onSubmit: (values: WarehouseFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function WarehouseForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const form = useForm<WarehouseFormValues>({
        resolver: zodResolver(warehouseFormSchema),
        defaultValues,
    });

    const isMobile = useIsMobile();

    useEffect(() => {
        form.reset(defaultValues);

        return form.reset();
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
                        title="Dados do depósito"
                        description="Informe o código, nome e descrição do depósito."
                    >
                        <FieldsGrid cols={2}>
                            <TextField
                                control={control}
                                name="code"
                                label="Código"
                                autoFocus={!isMobile}
                            />
                            <TextField control={control} name="name" label="Nome" />
                        </FieldsGrid>

                        <TextAreaField control={control} name="description" label="Descrição" />
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

export const defaultWarehouseFormValues: WarehouseFormValues = {
    code: "",
    name: "",
    description: "",
};
