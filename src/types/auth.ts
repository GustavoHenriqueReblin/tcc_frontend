import type { Role, Status } from "./global";

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
