import { z } from "zod";

export const harvestSchema = z.object({
    productId: z.number().refine((value) => value > 0, {
        message: "Selecione o produto.",
    }),
    warehouseId: z.number().refine((value) => value > 0, {
        message: "Selecione o depósito.",
    }),
    unitCost: z.number().refine((value) => value >= 0, {
        message: "Custo deve ser maior ou igual a zero.",
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

export type HarvestFormValues = z.infer<typeof harvestSchema>;
