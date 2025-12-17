import { z } from "zod";

export const unityFormSchema = z.object({
    simbol: z.string().min(1, "Informe o símbolo"),
    description: z.string().min(3, "Informe a descricao"),
});

export type UnityFormValues = z.infer<typeof unityFormSchema>;
