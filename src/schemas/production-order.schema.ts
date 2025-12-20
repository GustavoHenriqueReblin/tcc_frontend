import { z } from "zod";
import { ProductionOrderStatusEnum } from "@/types/enums";

const statusValues = Object.values(ProductionOrderStatusEnum) as [string, ...string[]];

export const productionOrderInputSchema = z.object({
    id: z.number().optional(),
    productId: z.number().refine((v) => v > 0, "Selecione a matéria-prima"),
    quantity: z.number().refine((v) => !isNaN(v) && v > 0, "Quantidade deve ser maior que zero"),
    unitCost: z.number().nullable().optional(),

    // UI
    productName: z.string().optional(),
    unitySimbol: z.string().optional(),
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

    warehouseId: z
        .number()
        .nullable()
        .refine((v) => v !== null && v > 0, "Selecione um depósito"),

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

    otherCosts: z
        .number()
        .nullable()
        .optional()
        .refine((v) => v === null || v >= 0, "Outros custos não podem ser negativos"),

    startDate: z.iso.datetime().nullable().optional(),
    endDate: z.iso.datetime().nullable().optional(),
    notes: z.string().nullable().optional(),
    inputs: z.array(productionOrderInputSchema).optional(),
});

export const finishProductionOrderSchema = z.object({
    producedQty: z.number().refine((v) => !isNaN(v) && v >= 0, "Quantidade produzida inválida"),

    wasteQty: z
        .number()
        .nullable()
        .optional()
        .refine((v) => v === null || v >= 0, "Perda não pode ser negativa"),

    endDate: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export type FinishProductionOrderValues = z.infer<typeof finishProductionOrderSchema>;

export type ProductionOrderInputValues = z.infer<typeof productionOrderInputSchema>;

export type ProductionOrderFormValues = z.infer<typeof productionOrderFormSchema>;
