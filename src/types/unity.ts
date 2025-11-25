import { Pagination } from "./global";

export interface Unity {
    id: number;
    enterpriseId: number;

    simbol: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UnitiesResponse {
    success: boolean;
    message: string;
    data: {
        items: Unity[];
        meta: Pagination;
    };
}
