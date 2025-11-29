import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProductForm, defaultProductFormValues } from "./ProductForm";
import type { ProductFormValues } from "@/schemas/product.schema";

import { api } from "@/api/client";
import type { Product } from "@/types/product";
import type { ApiResponse } from "@/types/global";

import { usePageTitle } from "@/hooks/usePageTitle";
import { Loading } from "@/components/Loading";
import { buildApiError } from "@/lib/utils";
import { toast } from "sonner";
import { isEqual } from "lodash-es";

export function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edicao de produto - ERP Industrial");

    useEffect(() => {
        if (!id) navigate("/products");
    }, [id, navigate]);

    const {
        data: product,
        error,
        isLoading,
    } = useQuery<Product, Error>({
        enabled: Boolean(id),
        queryKey: ["product", id],
        queryFn: async () => {
            try {
                const response = await api.get<ApiResponse<Product>>(`/products/${id}`);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao carregar produto");
                }

                return response.data.data;
            } catch (error) {
                throw buildApiError(error, "Erro ao carregar produto");
            }
        },
    });

    const updateMutation = useMutation<Product, Error, ProductFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Atualizando...");
            try {
                if (!id) throw new Error("Identificador invalido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteracao encontrada.", { id: toastId });
                    return;
                }

                const payload = {
                    name: values.name,
                    barcode: values.barcode || null,
                    productDefinitionId: values.productDefinitionId,
                    unityId: values.unityId,
                    inventory: {
                        costValue: values.costValue,
                        saleValue: values.saleValue,
                        quantity: values.quantity,
                    },
                };

                const response = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao atualizar produto");
                }

                toast.success("Produto alterado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error("Falha ao atualizar o produto.", { id: toastId });
                throw buildApiError(error, "Erro ao atualizar produto");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/products"],
                exact: false,
            });

            navigate("/products");
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    const inventory = product?.productInventory?.[0];

    const formDefaults: ProductFormValues = product
        ? {
              name: product.name || "",
              barcode: product.barcode || "",
              productDefinitionId: product.productDefinitionId ?? 0,
              unityId: product.unityId ?? 0,
              costValue: inventory ? Number(inventory.costValue) : 0,
              saleValue: inventory ? Number(inventory.saleValue) : 0,
              quantity: inventory ? Number(inventory.quantity) : 0,
          }
        : defaultProductFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar produto</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados do produto.</p>
            </div>

            {(error || updateMutation.error) && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error?.message ?? updateMutation.error?.message}
                </div>
            )}

            <ProductForm
                defaultValues={formDefaults}
                submitLabel="Atualizar produto"
                onSubmit={(values) => updateMutation.mutate(values)}
                onCancel={() => navigate("/products")}
                isLoading={updateMutation.isPending}
            />
        </div>
    );
}
