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

    quantity: number;
    unitCost: number | null;

    createdAt: string;
    updatedAt: string;
}

export interface ProductionOrder {
    id: number;
    enterpriseId: number;
    code: string;

    recipeId: number;
    warehouseId: number;
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
    producedQty: number | null;
    wasteQty: number | null;
    otherCosts: number | null;

    startDate: string | null;
    endDate: string | null;

    notes: string | null;

    createdAt: string;
    updatedAt: string;

    inputs?: ProductionOrderInput[];
}
