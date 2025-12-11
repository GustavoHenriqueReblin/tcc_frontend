import { Pagination, PersonType, Status } from "./global";
import { Person } from "./person";

export interface DeliveryAddress {
    id: number;
    customerId: number;
    enterpriseId: number;

    label: string | null;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    complement: string | null;
    reference: string | null;
    postalCode: string | null;

    cityId: number | null;
    stateId: number | null;
    countryId: number | null;

    isDefault: boolean;
    status: Status;

    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Customer {
    id: number;
    enterpriseId: number;
    personId: number;

    status: Status;
    type: PersonType;

    contactName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;

    createdAt: Date | string;
    updatedAt: Date | string;

    person: Person;

    deliveryAddress: DeliveryAddress[];
}

export interface CustomersResponse {
    success: boolean;
    message: string;
    data: {
        customers: Customer[];
        meta: Pagination;
    };
}
