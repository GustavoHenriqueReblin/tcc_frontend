import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WarehouseForm, defaultWarehouseFormValues } from "./WarehouseForm";
import { type WarehouseFormValues } from "@/schemas/warehouse.schema";
import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { Warehouse } from "@/types/warehouse";
import type { ApiResponse } from "@/types/global";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";

export function CreateWarehouse() {
    usePageTitle("Cadastro de depósito - ERP Industrial");
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const mutation = useMutation<Warehouse, Error, WarehouseFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");
            try {
                const payload = {
                    code: values.code,
                    name: values.name,
                    description: values.description || null,
                };

                const response = await api.post<ApiResponse<Warehouse>>("/warehouses", payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar depósito");
                }

                toast.success("Depósito cadastrado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao cadastrar o depósito.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao cadastrar depósito");
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

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar depósito</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar um novo depósito.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <WarehouseForm
                defaultValues={defaultWarehouseFormValues}
                submitLabel="Salvar depósito"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() => navigate("/warehouses")}
                isLoading={mutation.isPending}
            />
        </div>
    );
}
