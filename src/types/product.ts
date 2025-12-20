import { Pagination, ProductDefinitionType } from "./global";
import { Recipe } from "./recipe";

export interface ProductDefinition {
    id: number;
    enterpriseId: number;

    name: string;
    description: string | null;
    type: ProductDefinitionType;

    createdAt: string;
    updatedAt: string;
}

export interface Unity {
    id: number;
    enterpriseId: number;

    simbol: string;
    description: string;

    createdAt: string;
    updatedAt: string;
}

export interface ProductInventory {
    id: number;
    enterpriseId: number;
    productId: number;

    costValue: number;
    saleValue: number;
    quantity: number;

    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    enterpriseId: number;
    productDefinitionId: number;
    unityId: number;

    name: string;
    barcode: string | null;

    createdAt: string;
    updatedAt: string;

    productDefinition: ProductDefinition;
    unity: Unity;
    productInventory: ProductInventory[];
    recipe?: Recipe[];
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        meta: Pagination;
    };
}
