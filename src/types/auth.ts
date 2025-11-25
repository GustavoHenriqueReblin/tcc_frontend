import type { Role, Status } from "./global";

export interface Me {
    token: {
        sub: number;
        username: string;
        role: Role;
        enterpriseId: number;
        iat: number;
        exp: number;
    };
    user: {
        id: number;
        username: string;
        role: Role;
        status: Status;
        createdAt: string;
        updatedAt: string;
        enterpriseId: number;
        personId: number;

        person: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
            taxId: string | null;
            city: {
                name: string;
                state: {
                    uf: string;
                };
            };
        };

        enterprise: {
            id: number;
            name: string;
        };
    };
}

export interface User {
    id: number;
    username: string;
    role: Role;
    status: Status;
    personName: string;
    enterpriseName: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
    };
}

export interface LogoutResponse {
    success: boolean;
    message: string;
    data: {
        message: string;
    };
}
