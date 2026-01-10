import { z } from "zod";

export const purchaseEntryItemSchema = z.object({
    productId: z
        .number()
        .nullable()
        .refine((value) => value !== null && value > 0, {
            message: "Selecione um produto.",
        }),
    quantity: z.number().refine((value) => value > 0, {
        message: "Quantidade deve ser maior que zero.",
    }),
    unitCost: z.number().refine((value) => value >= 0, {
        message: "Custo deve ser maior ou igual a zero.",
    }),

    // UI
    productName: z.string().optional(),
    unitySimbol: z.string().optional(),
});

export const purchaseEntrySchema = z.object({
    supplierId: z
        .number()
        .nullable()
        .refine((value) => value !== null && value > 0, {
            message: "Selecione um fornecedor.",
        }),

    warehouseId: z
        .number()
        .nullable()
        .refine((value) => value !== null && value > 0, {
            message: "Selecione um depósito.",
        }),
    code: z.string().optional().nullable(),
    notes: z.string(),
    items: z
        .array(purchaseEntryItemSchema)
        .min(1, "Adicione ao menos um item.")
        .max(50, "Limite de 50 itens por lançamento."),
});

export type PurchaseEntryFormValues = z.infer<typeof purchaseEntrySchema>;
