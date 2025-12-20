import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Section, FieldsGrid, TextField, TextAreaField, EnumSelect } from "@/components/Fields";

import { customerFormSchema, CustomerFormValues } from "@/schemas/customer.schema";

import { StatusEnum, PersonTypeEnum, MaritalStatusEnum } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import { FormFooterFloating } from "@/components/FormFooterFloating";
import { maskCEP, maskCPFOrCNPJ, maskPhone, maskRG } from "@/utils/global";
import { maritalStatusLabels, personTypeLabels, statusLabels } from "@/types/global";
import { useEffect } from "react";
import { ComboboxQuery } from "@/components/ComboboxQuery";

interface Props {
    defaultValues: CustomerFormValues;
    onSubmit: (values: CustomerFormValues) => Promise<void> | void;
    submitLabel?: string;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function CustomerForm({
    defaultValues,
    onSubmit,
    submitLabel = "Salvar",
    isLoading = false,
    onCancel,
}: Props) {
    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
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
                        description="Informações gerais e documentos da pessoa vinculada ao cliente."
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

                        <FieldsGrid cols={4}>
                            <TextField
                                control={control}
                                name="person.taxId"
                                label="CPF/CNPJ"
                                mask={maskCPFOrCNPJ}
                            />
                            <TextField
                                control={control}
                                name="person.nationalId"
                                label="RG"
                                mask={maskRG}
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

                    <Section
                        title="Endereço"
                        description="Endereço principal da pessoa vinculada ao cliente."
                    >
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
                                extraParams={{ countryId, page: 1, limit: 30 }}
                            />

                            <ComboboxQuery
                                control={control}
                                name="person.cityId"
                                label="Cidade"
                                endpoint="/cities"
                                valueField="id"
                                labelField="name"
                                disabled={!stateId}
                                extraParams={{ stateId, page: 1, limit: 6000 }}
                            />
                        </FieldsGrid>

                        <TextAreaField control={control} name="person.notes" label="Observações" />
                    </Section>

                    <div className="mt-8"></div>

                    <Section
                        title="Dados gerais"
                        description="Configurações do cliente e contato principal."
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

                        <FieldsGrid cols={2}>
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

export const defaultCustomerFormValues: CustomerFormValues = {
    type: PersonTypeEnum.INDIVIDUAL,
    status: StatusEnum.ACTIVE,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
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
