import { Pagination, ProductDefinitionType } from "./global";

export interface ProductDefinition {
    id: number;
    enterpriseId: number;

    name: string;
    description: string | null;
    type: ProductDefinitionType;

    createdAt: Date;
    updatedAt: Date;
}

export interface Unity {
    id: number;
    enterpriseId: number;

    simbol: string;
    description: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface ProductInventory {
    id: number;
    enterpriseId: number;
    productId: number;

    costValue: number;
    saleValue: number;
    quantity: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: number;
    enterpriseId: number;
    productDefinitionId: number;
    unityId: number;

    name: string;
    barcode: string | null;

    createdAt: Date;
    updatedAt: Date;

    productDefinition: ProductDefinition;
    unity: Unity;
    productInventory: ProductInventory[];
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        meta: Pagination;
    };
}
