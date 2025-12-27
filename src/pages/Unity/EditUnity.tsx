import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { UnityForm, defaultUnityFormValues } from "./UnityForm";
import type { UnityFormValues } from "@/schemas/unity.schema";

import { api } from "@/api/client";
import type { Unity } from "@/types/unity";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

export function EditUnity() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de unidade - ERP industrial");

    useEffect(() => {
        if (!id) navigate("/unities");
    }, [id, navigate]);

    const {
        data: unity,
        error,
        isLoading,
    } = useQuery<Unity, Error>({
        enabled: Boolean(id),
        queryKey: ["unity", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<Unity>>(`/unities/${id}`);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar unidade");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar unidade");
            }
        },
    });

    const updateMutation = useMutation<Unity, Error, UnityFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador invalido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteração encontrada.", { id: toastId });
                    return;
                }

                const payload = {
                    simbol: values.simbol,
                    description: values.description,
                };

                const response = await api.put<ApiResponse<Unity>>(`/unities/${id}`, payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar unidade");
                }

                toast.success("Unidade alterada com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao atualizar a unidade.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao atualizar unidade");
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

    if (isLoading) {
        return <Loading />;
    }

    const formDefaults: UnityFormValues = unity
        ? {
              simbol: unity.simbol ?? "",
              description: unity.description ?? "",
          }
        : defaultUnityFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar unidade</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados da unidade.</p>
            </div>

            {error || updateMutation.error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error?.message ?? updateMutation.error?.message}
                </div>
            ) : (
                <UnityForm
                    defaultValues={formDefaults}
                    submitLabel="Atualizar unidade"
                    onSubmit={(values) => updateMutation.mutate(values)}
                    onCancel={() => navigate("/unities")}
                    isLoading={updateMutation.isPending}
                />
            )}
        </div>
    );
}
