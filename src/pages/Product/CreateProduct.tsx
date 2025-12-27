import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductForm } from "./ProductForm";
import { defaultProductFormValues } from "./ProductForm";
import { type ProductFormValues } from "@/schemas/product.schema";
import { api } from "@/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { Product } from "@/types/product";
import type { ApiResponse, ProductDefinitionType } from "@/types/global";
import { buildApiError } from "@/utils/global";
import { toast } from "sonner";
import { ProductDefinitionTypeEnum } from "@/types/enums";

export function CreateProduct() {
    usePageTitle("Cadastro de produto - ERP industrial");
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type") as ProductDefinitionType;

    const navigate = useNavigate();

    const mutation = useMutation<Product, Error, ProductFormValues>({
        mutationFn: async (values) => {
            const toastId = toast.loading("Cadastrando...");

            try {
                const recipesPayload = {
                    create: values.recipes.map((recipe) => ({
                        id: recipe.id,
                        description: recipe.description,
                        notes: recipe.notes,
                        items: {
                            create: recipe.items.map((item) => ({
                                id: item.id,
                                productId: item.productId,
                                quantity: item.quantity,
                            })),
                            update: [],
                            delete: [],
                        },
                    })),
                    update: [],
                    delete: [],
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
                    recipes: recipesPayload,
                };

                const response = await api.post<ApiResponse<Product>>("/products", payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao cadastrar produto");
                }

                toast.success("Produto cadastrado com sucesso.", { id: toastId });
                return response.data.data;
            } catch (error) {
                toast.error(error.response.data.message ?? "Falha ao cadastrar produto.", {
                    id: toastId,
                });
                throw buildApiError(error, "Erro ao cadastrar produto");
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["datatable", "/products"],
                exact: false,
            });

            navigate(
                type === ProductDefinitionTypeEnum.FINISHED_PRODUCT ? "/products" : "/raw-material"
            );
        },
    });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Cadastrar produto</h2>
                <p className="text-sm text-muted-foreground">
                    Utilize o formulário abaixo para cadastrar um novo produto.
                </p>
            </div>

            {mutation.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {mutation.error.message}
                </div>
            )}

            <ProductForm
                defaultValues={defaultProductFormValues}
                submitLabel="Salvar produto"
                onSubmit={(values) => mutation.mutate(values)}
                onCancel={() =>
                    navigate(
                        type === ProductDefinitionTypeEnum.FINISHED_PRODUCT
                            ? "/products"
                            : "/raw-material"
                    )
                }
                isLoading={mutation.isPending}
            />
        </div>
    );
}
