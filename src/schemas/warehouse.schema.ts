import { z } from "zod";

export const warehouseFormSchema = z.object({
    code: z.string().min(1, "Informe o código"),
    name: z.string().min(3, "Informe o nome"),
    description: z.string().optional().nullable(),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
