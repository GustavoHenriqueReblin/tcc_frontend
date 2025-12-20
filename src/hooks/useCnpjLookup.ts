import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "@/schemas/customer.schema";

interface UseCnpjLookupOptions {
    form: UseFormReturn<CustomerFormValues>;
}

export function useCnpjLookup({ form }: UseCnpjLookupOptions) {
    const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);

    const lookupCnpj = useCallback(
        async (rawCnpj: string | null) => {
            if (!rawCnpj) return;

            const cnpj = rawCnpj.replace(/\D/g, "");
            if (cnpj.length !== 14) return;

            try {
                setIsLoadingCnpj(true);

                const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
                if (!response.ok) return;

                const data = await response.json();
                const opts = {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                };

                form.setValue("person.legalName", data.razao_social || null, opts);
                form.setValue("person.name", data.nome_fantasia || data.razao_social || "", opts);
                form.setValue("person.email", data.email || null, opts);
                form.setValue("person.phone", data.ddd_telefone_1 || null, opts);
                form.setValue("person.street", data.logradouro || null, opts);
                form.setValue("person.number", data.numero || null, opts);
                form.setValue("person.neighborhood", data.bairro || null, opts);
                form.setValue("person.postalCode", data.cep || null, opts);
                form.setValue("person.complement", data.complemento || null, opts);
            } catch (err) {
                console.error("Erro ao consultar CNPJ", err);
            } finally {
                setIsLoadingCnpj(false);
            }
        },
        [form]
    );

    return {
        lookupCnpj,
        isLoadingCnpj,
    };
}
