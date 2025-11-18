import axios from "axios";
import { env } from "../config/env";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export const api = axios.create({
    baseURL: env.VITE_API_URL,
    withCredentials: true,
});
