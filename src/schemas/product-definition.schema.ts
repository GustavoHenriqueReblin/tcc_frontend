import { z } from "zod";
import { ProductDefinitionTypeEnum } from "@/types/enums";

export const productDefinitionFormSchema = z.object({
    name: z.string().min(3, "Nome obrigatorio"),
    description: z.string().optional().nullable(),
    type: z.enum(ProductDefinitionTypeEnum),
});

export type ProductDefinitionFormValues = z.infer<typeof productDefinitionFormSchema>;
