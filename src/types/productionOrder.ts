import { ProductionOrderStatus } from "./global";

export interface ProductionOrderInput {
    id: number;
    enterpriseId: number;
    productionOrderId: number;

    productId: number;
    product?: {
        id: number;
        name: string;
        unity: {
            id: number;
            name: string;
            simbol: string;
        };
    };

    quantity: string;
    unitCost: string | null;

    createdAt: string;
    updatedAt: string;
}

export interface ProductionOrder {
    id: number;
    enterpriseId: number;
    code: string;

    recipeId: number;
    recipe: {
        id: number;
        product?: {
            id: number;
            name: string;
            unity: {
                id: number;
                name: string;
                simbol: string;
            };
        };
    };

    lotId: number | null;
    lot?: {
        id: number;
        code: string;
    } | null;

    status: ProductionOrderStatus;

    plannedQty: number;
    producedQty: string | null;
    wasteQty: string | null;

    startDate: Date | string | null;
    endDate: Date | string | null;

    notes: string | null;

    createdAt: string;
    updatedAt: string;

    inputs?: ProductionOrderInput[];
}
