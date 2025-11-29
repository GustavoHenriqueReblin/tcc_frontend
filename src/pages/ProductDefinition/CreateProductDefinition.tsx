import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductDefinitionForm, defaultProductDefinitionFormValues } from "./ProductDefinitionForm";
import { type ProductDefinitionFormValues } from "@/schemas/product-definition.schema";
import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { ProductDefinition } from "@/types/productDefinition";
import type { ApiResponse } from "@/types/global";
import { buildApiError } from "@/lib/utils";
import { toast } from "sonner";

export function CreateProductDefinition() {
    usePageTitle("Cadastro de definição de produto - ERP Industrial");
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const mutation = useMutation<ProductDefinition, Error, ProductDefinitionFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const payload = {
                    name: values.name,
                    description: values.description || null,
                    type: values.type,
                };

                const response = await api.post<ApiResponse<ProductDefinition>>(
                    "/product-definitions",
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar definição");
                }

                toast.success("Definição cadastrada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao cadastrar a definição.", { id: toastId });
                throw buildApiError(error, "Erro ao cadastrar definição");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/product-definitions"],
                exact: false,
            });

            navigate("/product-definitions");
        },
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar definição de produto</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar uma nova definição.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <ProductDefinitionForm
                defaultValues={defaultProductDefinitionFormValues}
                submitLabel="Salvar definição"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/product-definitions")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
