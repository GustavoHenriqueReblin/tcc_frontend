import { z } from "zod";

export const recipeItemFormSchema = z.object({
    id: z.union([z.number(), z.string()]).optional(),
    productId: z.number().min(1, "Selecione a matéria prima"),
    quantity: z.number().refine((value) => value > 0, "Quantidade deve ser maior que zero."),
    productName: z.string().optional().nullable(),
    unitySimbol: z.string().optional().nullable(),
});

export const recipeFormSchema = z.object({
    id: z.union([z.number(), z.string()]).optional(),
    description: z
        .string()
        .min(3, "Descrição obrigatória")
        .transform((v) => v.trim()),
    notes: z.string().optional().nullable(),
    items: z.array(recipeItemFormSchema).min(1, "Adicione ao menos uma matéria prima."),
});

export const productFormSchema = z.object({
    name: z
        .string()
        .min(3, "Nome obrigatório")
        .transform((v) => v.trim()),

    barcode: z.string().trim().optional().nullable(),

    productDefinitionId: z.number().min(1, "Selecione uma definição de produto"),

    unityId: z.number().min(1, "Selecione uma unidade"),

    costValue: z.number().refine((v) => !isNaN(v), "Informe o custo"),

    saleValue: z.number().refine((v) => !isNaN(v), "Informe o valor de venda"),

    quantity: z.number().refine((v) => !isNaN(v), "Informe a quantidade"),

    recipes: z.array(recipeFormSchema),
});

export type RecipeItemFormValue = z.infer<typeof recipeItemFormSchema>;
export type RecipeFormValue = z.infer<typeof recipeFormSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;
