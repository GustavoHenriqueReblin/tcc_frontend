import { Pagination } from "./global";

export interface Warehouse {
    id: number;
    enterpriseId: number;

    code: string;
    name: string;
    description: string | null;

    createdAt: Date;
    updatedAt: Date;
}

export interface WarehousesResponse {
    success: boolean;
    message: string;
    data: {
        warehouses: Warehouse[];
        meta: Pagination;
    };
}
