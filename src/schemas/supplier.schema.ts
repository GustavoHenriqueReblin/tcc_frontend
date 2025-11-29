import { z } from "zod";
import { MaritalStatusEnum, PersonTypeEnum, StatusEnum } from "@/types/enums";
import { isValidCPFOrCNPJ, isValidEmail } from "@/lib/utils";

export const supplierFormSchema = z.object({
    contactName: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    contactEmail: z
        .string()
        .optional()
        .nullable()
        .refine((value) => !value || isValidEmail(value), "E-mail invalido"),

    website: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    deliveryTime: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),

    type: z.enum(PersonTypeEnum),
    status: z.enum(StatusEnum),

    person: z.object({
        name: z.string().min(3, "Nome obrigatorio"),

        legalName: z.string().nullable().optional(),

        taxId: z
            .string()
            .optional()
            .nullable()
            .refine((value) => !value || isValidCPFOrCNPJ(value), "CPF/CNPJ invalido"),

        nationalId: z.string().nullable().optional(),

        email: z
            .string()
            .optional()
            .nullable()
            .refine((value) => !value || isValidEmail(value), "E-mail invalido"),

        phone: z.string().optional().nullable(),
        cellphone: z.string().nullable().optional(),

        maritalStatus: z.enum(MaritalStatusEnum).nullable().optional(),

        neighborhood: z.string().optional().nullable(),
        street: z.string().optional().nullable(),
        number: z.string().optional().nullable(),
        complement: z.string().nullable().optional(),
        postalCode: z.string().optional().nullable(),
        notes: z.string().nullable().optional(),

        dateOfBirth: z.string().nullable().optional(),

        countryId: z.number().optional().nullable(),
        stateId: z.number().optional().nullable(),
        cityId: z.number().optional().nullable(),
    }),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
