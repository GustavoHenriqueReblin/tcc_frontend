import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { api } from "@/api/client";
import { ApiResponse, ServerList } from "@/types/global";
import { CustomerFormValues } from "@/schemas/customer.schema";
import { buildApiError } from "@/utils/global";

interface UseCnpjLookupOptions {
    form: UseFormReturn<CustomerFormValues>;
}

interface BrasilApiCnpjResponse {
    cnpj: string;
    razao_social: string | null;
    nome_fantasia: string | null;
    email: string | null;
    ddd_telefone_1: string | null;
    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    cep: string | null;
    complemento: string | null;
    uf: string;
    municipio: string;
    codigo_municipio_ibge: number;
}

interface State {
    id: number;
    code: string;
}

interface City {
    id: number;
    name: string;
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

                const data: BrasilApiCnpjResponse = await response.json();

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

                if (!data.uf || !data.municipio) return;

                const statesRes = await api.get<ApiResponse<ServerList<State>>>("/states", {
                    params: {
                        countryId: 1,
                        search: data.uf,
                        limit: 1,
                    },
                });

                if (!statesRes.data.success || statesRes.data.data.items.length === 0) {
                    return;
                }

                const state = statesRes.data.data.items[0];

                form.setValue("person.stateId", state.id, opts);

                const citiesRes = await api.get<ApiResponse<ServerList<City>>>("/cities", {
                    params: {
                        stateId: state.id,
                        search: data.municipio,
                        limit: 1,
                    },
                });

                if (!citiesRes.data.success || citiesRes.data.data.items.length === 0) {
                    return;
                }

                const city = citiesRes.data.data.items[0];

                form.setValue("person.cityId", city.id, opts);
            } catch (error) {
                console.error(buildApiError(error, "Erro ao consultar CNPJ"));
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
