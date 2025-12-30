import { z } from "zod";
import { OrderStatusEnum } from "@/types/enums";

const orderStatuses = Object.values(OrderStatusEnum) as [string, ...string[]];

export const saleOrderItemSchema = z.object({
    id: z.number().optional(),

    productId: z
        .number()
        .nullable()
        .refine((value) => value !== null && value > 0, {
            message: "Selecione um produto.",
        }),

    quantity: z.number().refine((value) => value > 0, {
        message: "Quantidade deve ser maior que zero.",
    }),

    unitPrice: z.number().refine((value) => value >= 0, {
        message: "Valor unitario deve ser maior ou igual a zero.",
    }),

    productUnitPrice: z.number().refine((value) => value >= 0, {
        message: "Valor unitario do produto deve ser maior ou igual a zero.",
    }),

    unitCost: z.number().refine((value) => value >= 0, {
        message: "Custo unitario deve ser maior ou igual a zero.",
    }),

    // UI
    inventoryQuantity: z.number().optional(),
    productName: z.string().optional(),
    unitySimbol: z.string().optional(),
});

export const saleOrderFormSchema = z.object({
    customerId: z
        .number()
        .nullable()
        .refine((value) => value !== null && value > 0, {
            message: "Selecione um cliente.",
        }),

    warehouseId: z
        .number()
        .nullable()
        .refine((value) => value !== null && value > 0, {
            message: "Selecione um deposito.",
        }),

    code: z.string().refine((value) => value.trim().length > 0, {
        message: "Informe o codigo da venda.",
    }),

    status: z.enum(orderStatuses),

    discount: z.number().min(0, "Desconto nao pode ser negativo."),
    otherCosts: z.number().min(0, "Outros custos nao podem ser negativos."),
    notes: z.string(),

    items: z
        .array(saleOrderItemSchema)
        .min(1, "Adicione ao menos um item.")
        .max(100, "Limite de 100 itens por venda."),
});

export type SaleOrderItemFormValues = z.infer<typeof saleOrderItemSchema>;
export type SaleOrderFormValues = z.infer<typeof saleOrderFormSchema>;
