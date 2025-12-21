export const StatusEnum = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const;

export const PlanEnum = {
    START: "START",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
} as const;

export const BranchEnum = {
    INDUSTRY: "INDUSTRY",
} as const;

export const RoleEnum = {
    EMPLOYEE: "EMPLOYEE",
    MANAGER: "MANAGER",
    OWNER: "OWNER",
} as const;

export const MaritalStatusEnum = {
    SINGLE: "SINGLE",
    MARRIED: "MARRIED",
    DIVORCED: "DIVORCED",
    WIDOWED: "WIDOWED",
    SEPARATED: "SEPARATED",
    OTHER: "OTHER",
} as const;

export const PersonTypeEnum = {
    INDIVIDUAL: "INDIVIDUAL",
    BUSINESS: "BUSINESS",
} as const;

export const ProductDefinitionTypeEnum = {
    RAW_MATERIAL: "RAW_MATERIAL",
    FINISHED_PRODUCT: "FINISHED_PRODUCT",
    RESALE_PRODUCT: "RESALE_PRODUCT",
    IN_PROCESS_PRODUCT: "IN_PROCESS_PRODUCT",
    COMPONENT: "COMPONENT",
    CONSUMABLE_MATERIAL: "CONSUMABLE_MATERIAL",
    PACKAGING_MATERIAL: "PACKAGING_MATERIAL",
    BY_PRODUCT: "BY_PRODUCT",
    RETURNED_PRODUCT: "RETURNED_PRODUCT",
} as const;

export const MovementTypeEnum = {
    IN: "IN",
    OUT: "OUT",
} as const;

export const MovementSourceEnum = {
    PURCHASE: "PURCHASE",
    HARVEST: "HARVEST",
    SALE: "SALE",
    ADJUSTMENT: "ADJUSTMENT",
    PRODUCTION: "PRODUCTION",
} as const;

export const ProductionOrderStatusEnum = {
    PLANNED: "PLANNED",
    RUNNING: "RUNNING",
    FINISHED: "FINISHED",
    CANCELED: "CANCELED",
} as const;

export const OrderStatusEnum = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    SHIPPED: "SHIPPED",
    RECEIVED: "RECEIVED",
    FINISHED: "FINISHED",
    CANCELED: "CANCELED",
} as const;

export const TransactionTypeEnum = {
    CREDIT: "CREDIT",
    DEBIT: "DEBIT",
} as const;

export const PaymentStatusEnum = {
    PENDING: "PENDING",
    PAID: "PAID",
    OVERDUE: "OVERDUE",
    CANCELLED: "CANCELLED",
} as const;

export const PaymentMethodEnum = {
    CASH: "CASH",
    PIX: "PIX",
    CARD: "CARD",
    BANK_SLIP: "BANK_SLIP",
    TRANSFER: "TRANSFER",
    OTHER: "OTHER",
} as const;

export const AssetStatusEnum = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    SOLD: "SOLD",
    DISPOSED: "DISPOSED",
    LOST: "LOST",
} as const;

export const AssetMaintenanceTypeEnum = {
    CLEANING: "CLEANING",
    LUBRICATION: "LUBRICATION",
    ADJUSTMENT: "ADJUSTMENT",
    PART_REPLACEMENT: "PART_REPLACEMENT",
    INSPECTION: "INSPECTION",
    CORRECTIVE: "CORRECTIVE",
    PREVENTIVE: "PREVENTIVE",
    OTHER: "OTHER",
} as const;
