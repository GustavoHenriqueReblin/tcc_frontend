import { z } from "zod";

export const productFormSchema = z.object({
    name: z
        .string()
        .min(3, "Nome obrigatório")
        .transform((v) => v.trim()),

    barcode: z
        .string()
        .trim()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v)),

    productDefinitionId: z.number().min(1, "Selecione uma definição de produto"),

    unityId: z.number().min(1, "Selecione uma unidade"),

    costValue: z.number().refine((v) => !isNaN(v), "Informe o custo"),

    saleValue: z.number().refine((v) => !isNaN(v), "Informe o valor de venda"),

    quantity: z.number().refine((v) => !isNaN(v), "Informe a quantidade"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
