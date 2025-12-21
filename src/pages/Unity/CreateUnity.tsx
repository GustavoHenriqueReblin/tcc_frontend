import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UnityForm, defaultUnityFormValues } from "./UnityForm";
import { type UnityFormValues } from "@/schemas/unity.schema";
import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { Unity } from "@/types/unity";
import type { ApiResponse } from "@/types/global";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";

export function CreateUnity() {
    usePageTitle("Cadastro de unidade - ERP Industrial");
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const mutation = useMutation<Unity, Error, UnityFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const payload = {
                    simbol: values.simbol,
                    description: values.description,
                };

                const response = await api.post<ApiResponse<Unity>>("/unities", payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar unidade");
                }

                toast.success("Unidade cadastrada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao cadastrar a unidade.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao cadastrar unidade");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/unities"],
                exact: false,
            });

            navigate("/unities");
        },
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar unidade</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar uma nova unidade.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <UnityForm
                defaultValues={defaultUnityFormValues}
                submitLabel="Salvar unidade"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/unities")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
