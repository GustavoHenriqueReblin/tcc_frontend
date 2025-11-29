import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField } from "@/components/Fields";

import { unityFormSchema, type UnityFormValues } from "@/schemas/unity.schema";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";

interface Props {
    defaultValues: UnityFormValues;
    onSubmit: (values: UnityFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function UnityForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const form = useForm<UnityFormValues>({
        resolver: zodResolver(unityFormSchema),
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
                        title="Dados da unidade"
                        description="Informe simbolo e descricao da unidade."
                    >
                        <FieldsGrid cols={2}>
                            <TextField control={control} name="simbol" label="Simbolo" autoFocus />
                            <TextField control={control} name="description" label="Descrição" />
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
        </div>
    );
}

export const defaultUnityFormValues: UnityFormValues = {
    simbol: "",
    description: "",
};
