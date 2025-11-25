import { Pagination, PersonType, Status } from "./global";
import { Person } from "./person";

export interface Supplier {
    id: number;
    enterpriseId: number;
    personId: number;

    status: Status;
    type: PersonType;

    contactName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;

    website: string | null;
    paymentTerms: string | null;
    deliveryTime: string | null;
    category: string | null;
    notes: string | null;

    createdAt: Date;
    updatedAt: Date;

    person: Person;
}

export interface SuppliersResponse {
    success: boolean;
    message: string;
    data: {
        items: Supplier[];
        meta: Pagination;
    };
}
