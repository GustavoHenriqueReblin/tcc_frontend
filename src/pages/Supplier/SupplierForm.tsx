import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";

import { supplierFormSchema, type SupplierFormValues } from "@/schemas/supplier.schema";

import { StatusEnum, PersonTypeEnum, MaritalStatusEnum } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { maskCEP, maskCPFOrCNPJ, maskPhone } from "@/utils/global";
import { maritalStatusLabels, personTypeLabels, statusLabels } from "@/types/global";
import { ComboboxQuery } from "@/components/ComboboxQuery";

interface Props {
    defaultValues: SupplierFormValues;
    onSubmit: (values: SupplierFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function SupplierForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierFormSchema),
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
    const countryId = form.watch("person.countryId");
    const stateId = form.watch("person.stateId");

    return (
        <div className="rounded-md border bg-card text-card-foreground p-6">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Section
                        title="Dados da pessoa"
                        description="Informações gerais da pessoa vinculada ao fornecedor."
                    >
                        <FieldsGrid cols={2}>
                            <TextField
                                control={control}
                                name="person.name"
                                label="Nome *"
                                autoFocus
                            />
                            <TextField
                                control={control}
                                name="person.legalName"
                                label="Razão social"
                            />
                        </FieldsGrid>

                        <FieldsGrid cols={3}>
                            <TextField
                                control={control}
                                name="person.taxId"
                                label="CPF/CNPJ"
                                mask={maskCPFOrCNPJ}
                            />
                            <TextField
                                control={control}
                                name="person.dateOfBirth"
                                label="Data de nascimento"
                                type="date"
                            />
                            <EnumSelect
                                control={control}
                                name="person.maritalStatus"
                                label="Estado civil"
                                enumObject={MaritalStatusEnum}
                                labels={maritalStatusLabels}
                                allowEmpty
                            />
                        </FieldsGrid>

                        <FieldsGrid cols={3}>
                            <TextField control={control} name="person.email" label="E-mail" />
                            <TextField
                                control={control}
                                name="person.phone"
                                label="Telefone"
                                mask={maskPhone}
                            />
                            <TextField
                                control={control}
                                name="person.cellphone"
                                label="Celular"
                                mask={maskPhone}
                            />
                        </FieldsGrid>
                    </Section>

                    <div className="mt-8"></div>

                    <Section title="Endereço" description="Endereço principal da pessoa.">
                        <FieldsGrid cols={2}>
                            <TextField control={control} name="person.street" label="Rua" />
                            <TextField control={control} name="person.number" label="Número" />
                        </FieldsGrid>

                        <FieldsGrid cols={3}>
                            <TextField
                                control={control}
                                name="person.neighborhood"
                                label="Bairro"
                            />
                            <TextField
                                control={control}
                                name="person.postalCode"
                                label="CEP"
                                mask={maskCEP}
                            />
                            <TextField
                                control={control}
                                name="person.complement"
                                label="Complemento"
                            />
                        </FieldsGrid>

                        <FieldsGrid cols={3}>
                            <ComboboxQuery
                                control={control}
                                name="person.countryId"
                                label="País"
                                endpoint="/countries"
                                valueField="id"
                                labelField="name"
                            />

                            <ComboboxQuery
                                control={control}
                                name="person.stateId"
                                label="Estado"
                                endpoint="/states"
                                valueField="id"
                                labelField="name"
                                disabled={!countryId}
                                extraParams={{ countryId }}
                            />

                            <ComboboxQuery
                                control={control}
                                name="person.cityId"
                                label="Cidade"
                                endpoint="/cities"
                                valueField="id"
                                labelField="name"
                                disabled={!stateId}
                                extraParams={{ stateId }}
                            />
                        </FieldsGrid>

                        <TextAreaField control={control} name="person.notes" label="Observacões" />
                    </Section>

                    <div className="mt-8"></div>

                    <Section
                        title="Dados gerais"
                        description="Configurações e contato principal do fornecedor."
                    >
                        <FieldsGrid cols={3}>
                            <EnumSelect
                                control={control}
                                name="type"
                                label="Tipo"
                                enumObject={PersonTypeEnum}
                                labels={personTypeLabels}
                            />
                            <EnumSelect
                                control={control}
                                name="status"
                                label="Status"
                                enumObject={StatusEnum}
                                labels={statusLabels}
                            />
                            <TextField
                                control={control}
                                name="contactName"
                                label="Contato principal"
                            />
                        </FieldsGrid>

                        <FieldsGrid cols={3}>
                            <TextField
                                control={control}
                                name="contactPhone"
                                label="Telefone do contato"
                                mask={maskPhone}
                            />
                            <TextField
                                control={control}
                                name="contactEmail"
                                label="E-mail do contato"
                            />
                            <TextField control={control} name="website" label="Website" />
                        </FieldsGrid>
                    </Section>

                    <div className="mt-8"></div>

                    <Section
                        title="Informações comerciais"
                        description="Prazos, categorias e observações gerais do fornecedor."
                    >
                        <FieldsGrid cols={3}>
                            <TextField
                                control={control}
                                name="paymentTerms"
                                label="Condições de pagamento"
                            />
                            <TextField
                                control={control}
                                name="deliveryTime"
                                label="Prazo de entrega"
                            />
                            <TextField control={control} name="category" label="Categoria" />
                        </FieldsGrid>

                        <TextAreaField control={control} name="notes" label="Observacões gerais" />
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

export const defaultSupplierFormValues: SupplierFormValues = {
    type: PersonTypeEnum.INDIVIDUAL,
    status: StatusEnum.ACTIVE,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    website: null,
    paymentTerms: null,
    deliveryTime: null,
    category: null,
    notes: "",
    person: {
        name: "",
        legalName: null,
        taxId: null,
        nationalId: null,
        email: null,
        phone: null,
        cellphone: null,
        maritalStatus: null,
        neighborhood: null,
        street: null,
        number: null,
        complement: null,
        postalCode: null,
        notes: "",
        dateOfBirth: null,
        countryId: 1,
        stateId: null,
        cityId: null,
    },
};
