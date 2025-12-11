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
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { isEqual } from "lodash-es";
import { buildNestedPayload } from "@/utils/buildNestedItems";

export function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    usePageTitle("Edição de produto - ERP Industrial");

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
                if (!id) throw new Error("Identificador inválido");

                if (isEqual(formDefaults, values)) {
                    toast.info("Nenhuma alteração encontrada.", { id: toastId });
                    return;
                }

                const recipesPayload = buildNestedPayload({
                    original: formDefaults.recipes,
                    edited: values.recipes,
                    getId: (r) => r.id,
                    isEqual: (orig, edit) =>
                        orig.description === edit.description &&
                        orig.notes === edit.notes &&
                        JSON.stringify(orig.items) === JSON.stringify(edit.items),
                });

                const recipesWithItems = {
                    create: recipesPayload.create.map((r) => {
                        return {
                            ...r,
                            items: buildNestedPayload({
                                original: [],
                                edited: r.items,
                                getId: (i) => i.id,
                                isEqual: (o, e) =>
                                    o.productId === e.productId &&
                                    Number(o.quantity) === Number(e.quantity),
                            }),
                        };
                    }),

                    update: recipesPayload.update.map((r) => {
                        const orig = formDefaults.recipes.find((o) => o.id === r.id);

                        return {
                            ...r,
                            items: buildNestedPayload({
                                original: orig?.items ?? [],
                                edited: r.items,
                                getId: (i) => i.id,
                                isEqual: (o, e) =>
                                    o.productId === e.productId &&
                                    Number(o.quantity) === Number(e.quantity),
                            }),
                        };
                    }),

                    delete: recipesPayload.delete,
                };

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
                    recipes: recipesWithItems,
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

    if (isLoading) return <Loading />;

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

              recipes:
                  product.recipe?.map((recipe) => ({
                      id: recipe.id,
                      description: recipe.description,
                      notes: recipe.notes,

                      items:
                          recipe.items?.map((item) => ({
                              id: item.id,
                              productId: item.productId,
                              quantity: Number(item.quantity),
                              productName: item.product?.name ?? null,
                              unitySimbol: item.product?.unity?.simbol ?? null,
                          })) ?? [],
                  })) ?? [],
          }
        : defaultProductFormValues;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Editar produto</h2>
                <p className="text-sm text-muted-foreground">Atualize os dados do produto.</p>
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
                    <ProductForm
                        defaultValues={formDefaults}
                        submitLabel="Atualizar produto"
                        onSubmit={(values) => updateMutation.mutate(values)}
                        onCancel={() => navigate("/products")}
                        isLoading={updateMutation.isPending}
                        Id={Number(id)}
                    />
                </>
            )}
        </div>
    );
}
