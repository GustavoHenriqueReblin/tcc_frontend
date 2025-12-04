import { z } from "zod";

export const adjustmentEntrySchema = z.object({
    productId: z.number().refine((value) => value > 0, {
        message: "Selecione o produto.",
    }),
    warehouseId: z.number().refine((value) => value > 0, {
        message: "Selecione o depósito.",
    }),
    quantity: z
        .number()
        .optional()
        .nullable()
        .refine((value) => value !== null && value !== undefined, {
            message: "Quantidade deve ser informada.",
        }),
    notes: z.string(),
});

export type AdjustmentEntryFormValues = z.infer<typeof adjustmentEntrySchema>;
