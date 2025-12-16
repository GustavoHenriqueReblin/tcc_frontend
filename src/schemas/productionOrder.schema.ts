import { z } from "zod";
import { ProductionOrderStatusEnum } from "@/types/enums";

const statusValues = Object.values(ProductionOrderStatusEnum) as [string, ...string[]];

export const productionOrderInputSchema = z.object({
    id: z.number().optional(),

    productId: z.number().refine((v) => v > 0, "Selecione a matéria-prima"),

    quantity: z.number().refine((v) => !isNaN(v) && v > 0, "Quantidade deve ser maior que zero"),

    unitCost: z.number().nullable().optional(),
});

export const productionOrderFormSchema = z.object({
    code: z
        .string()
        .min(1, "Informe o código")
        .transform((v) => v.trim()),

    recipeId: z
        .number()
        .nullable()
        .refine((v) => v !== null && v > 0, "Selecione uma receita"),

    lotId: z.number().nullable().optional(),

    status: z.enum(statusValues),

    plannedQty: z
        .number()
        .refine((v) => !isNaN(v) && v > 0, "Quantidade planejada deve ser maior que zero"),

    producedQty: z
        .number()
        .nullable()
        .optional()
        .refine((v) => v === null || v >= 0, "Quantidade produzida não pode ser negativa"),

    wasteQty: z
        .number()
        .nullable()
        .optional()
        .refine((v) => v === null || v >= 0, "Perda não pode ser negativa"),

    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),

    notes: z.string().nullable().optional(),

    inputs: z.array(productionOrderInputSchema).optional(),
});

export type ProductionOrderFormValues = z.infer<typeof productionOrderFormSchema>;
