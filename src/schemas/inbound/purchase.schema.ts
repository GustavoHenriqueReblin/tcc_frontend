import { z } from "zod";

export const purchaseEntryItemSchema = z.object({
    productId: z.number().refine((value) => value > 0, {
        message: "Selecione o produto.",
    }),
    quantity: z.number().refine((value) => value > 0, {
        message: "Quantidade deve ser maior que zero.",
    }),
    unitCost: z.number().refine((value) => value >= 0, {
        message: "Custo deve ser maior ou igual a zero.",
    }),
});

export const purchaseEntrySchema = z.object({
    supplierId: z.number().refine((value) => value > 0, {
        message: "Selecione um fornecedor.",
    }),
    code: z.string().refine((value) => value.trim().length > 0, {
        message: "Informe o código da compra.",
    }),
    notes: z.string(),
    items: z
        .array(purchaseEntryItemSchema)
        .min(1, "Adicione ao menos um item.")
        .max(50, "Limite de 50 itens por lançamento."),
});

export type PurchaseEntryFormValues = z.infer<typeof purchaseEntrySchema>;
