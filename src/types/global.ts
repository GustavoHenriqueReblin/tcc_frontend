import "@tanstack/react-table";
import {
    AssetMaintenanceTypeEnum,
    AssetStatusEnum,
    BranchEnum,
    MaritalStatusEnum,
    MovementSourceEnum,
    MovementTypeEnum,
    OrderStatusEnum,
    PaymentMethodEnum,
    PaymentStatusEnum,
    PersonTypeEnum,
    PlanEnum,
    ProductDefinitionTypeEnum,
    ProductionOrderStatusEnum,
    RoleEnum,
    StatusEnum,
    TransactionTypeEnum,
} from "./enums";

export type Status = (typeof StatusEnum)[keyof typeof StatusEnum];
export type Plan = (typeof PlanEnum)[keyof typeof PlanEnum];
export type Branch = (typeof BranchEnum)[keyof typeof BranchEnum];
export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];
export type MaritalStatus = (typeof MaritalStatusEnum)[keyof typeof MaritalStatusEnum];
export type PersonType = (typeof PersonTypeEnum)[keyof typeof PersonTypeEnum];
export type MovementType = (typeof MovementTypeEnum)[keyof typeof MovementTypeEnum];
export type MovementSource = (typeof MovementSourceEnum)[keyof typeof MovementSourceEnum];
export type OrderStatus = (typeof OrderStatusEnum)[keyof typeof OrderStatusEnum];
export type TransactionType = (typeof TransactionTypeEnum)[keyof typeof TransactionTypeEnum];
export type PaymentStatus = (typeof PaymentStatusEnum)[keyof typeof PaymentStatusEnum];
export type PaymentMethod = (typeof PaymentMethodEnum)[keyof typeof PaymentMethodEnum];
export type AssetStatus = (typeof AssetStatusEnum)[keyof typeof AssetStatusEnum];
export type AssetMaintenanceType =
    (typeof AssetMaintenanceTypeEnum)[keyof typeof AssetMaintenanceTypeEnum];
export type ProductionOrderStatus =
    (typeof ProductionOrderStatusEnum)[keyof typeof ProductionOrderStatusEnum];
export type ProductDefinitionType =
    (typeof ProductDefinitionTypeEnum)[keyof typeof ProductDefinitionTypeEnum];

export const personTypeLabels: Record<keyof typeof PersonTypeEnum, string> = {
    INDIVIDUAL: "Pessoa física",
    BUSINESS: "Pessoa jurídica",
};

export const statusLabels: Record<keyof typeof StatusEnum, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
};

export const maritalStatusLabels: Record<keyof typeof MaritalStatusEnum, string> = {
    SINGLE: "Solteiro(a)",
    MARRIED: "Casado(a)",
    DIVORCED: "Divorciado(a)",
    WIDOWED: "Viúvo(a)",
    SEPARATED: "Separado(a)",
    OTHER: "Outro",
};

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> {
        sortable?: boolean;
    }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export interface Pagination {
    total: number;
    page: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta: Pagination;
}

export interface City {
    id: number;
    stateId: number;
    name: string;
    ibgeCode: number;
}

export interface State {
    id: number;
    countryId: number;
    name: string;
    uf: string;
    ibgeCode: number;
}

export interface Country {
    id: number;
    name: string;
    isoCode: string;
}
