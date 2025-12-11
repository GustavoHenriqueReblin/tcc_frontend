import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WarehouseForm, defaultWarehouseFormValues } from "./WarehouseForm";
import type { WarehouseFormValues } from "@/schemas/warehouse.schema";

import { api } from "@/api/client";
import type { Warehouse } from "@/types/warehouse";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

export function EditWarehouse() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de depósito - ERP Industrial");

    useEffect(() => {
        if (!id) navigate("/warehouses");
    }, [id, navigate]);

    const {
        data: warehouse,
        error,
        isLoading,
    } = useQuery<Warehouse, Error>({
        enabled: Boolean(id),
        queryKey: ["warehouse", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar depósito");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar depósito");
            }
        },
    });

    const updateMutation = useMutation<Warehouse, Error, WarehouseFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador invalido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteração encontrada.", { id: toastId });
                    return;
                }

                const payload = {
                    code: values.code,
                    name: values.name,
                    description: values.description || null,
                };

                const response = await api.put<ApiResponse<Warehouse>>(
                    `/warehouses/${id}`,
                    payload
                );

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar depósito");
                }

                toast.success("Depósito alterado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao atualizar o depósito.", { id: toastId });
                throw buildApiError(error, "Erro ao atualizar depósito");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/warehouses"],
                exact: false,
            });

            navigate("/warehouses");
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    const formDefaults: WarehouseFormValues = warehouse
        ? {
              code: warehouse.code || "",
              name: warehouse.name || "",
              description: warehouse.description || "",
          }
        : defaultWarehouseFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar depósito</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados do depósito.</p>
            </div>

            {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error?.message}
                </div>
            ) : (
                <>
                    {updateMutation.error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {updateMutation.error?.message}
                        </div>
                    )}
                    <WarehouseForm
                        defaultValues={formDefaults}
                        submitLabel="Atualizar depósito"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/warehouses")}
                        isLoading={updateMutation.isPending}
                    />
                </>
            )}
        </div>
    );
}
