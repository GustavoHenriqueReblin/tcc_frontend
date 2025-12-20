import { Pagination, ProductDefinitionType } from "./global";

export interface ProductDefinition {
    id: number;
    enterpriseId: number;

    name: string;
    description: string | null;
    type: ProductDefinitionType;

    createdAt: string;
    updatedAt: string;
}

export interface ProductDefinitionsResponse {
    success: boolean;
    message: string;
    data: {
        productDefinitions: ProductDefinition[];
        meta: Pagination;
    };
}
