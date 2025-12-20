import { City, Country, State } from "./global";

export interface Person {
    id: number;
    enterpriseId: number;

    countryId: number | null;
    stateId: number | null;
    cityId: number | null;

    name: string | null;
    legalName: string | null;
    taxId: string | null;
    nationalId: string | null;
    maritalStatus: string | null;

    neighborhood: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    postalCode: string | null;

    notes: string | null;

    email: string | null;
    phone: string | null;
    cellphone: string | null;

    dateOfBirth: string | null;

    createdAt: string;
    updatedAt: string;

    city?: City | null;
    state?: State | null;
    country?: Country | null;
}
