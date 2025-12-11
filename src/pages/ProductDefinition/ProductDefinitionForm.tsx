import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";

import {
    productDefinitionFormSchema,
    type ProductDefinitionFormValues,
} from "@/schemas/product-definition.schema";

import { ProductDefinitionTypeEnum } from "@/types/enums";
import { productDefinitionTypeLabels } from "@/types/global";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";

interface Props {
    defaultValues: ProductDefinitionFormValues;
    onSubmit: (values: ProductDefinitionFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function ProductDefinitionForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const form = useForm<ProductDefinitionFormValues>({
        resolver: zodResolver(productDefinitionFormSchema),
        defaultValues,
    });

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
                        title="Dados da definição"
                        description="Informe os dados principais desta definição de produto."
                    >
                        <FieldsGrid cols={2}>
                            <TextField control={control} name="name" label="Nome" autoFocus />
                            <EnumSelect
                                control={control}
                                name="type"
                                label="Tipo"
                                enumObject={ProductDefinitionTypeEnum}
                                labels={productDefinitionTypeLabels}
                            />
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

export const defaultProductDefinitionFormValues: ProductDefinitionFormValues = {
    name: "",
    description: "",
    type: ProductDefinitionTypeEnum.FINISHED_PRODUCT,
};
