import { ApiResponse } from "@/types/global";
import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function maskCPF(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
}

export function maskCNPJ(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
}

export function maskCPFOrCNPJ(value: string) {
    const numbers = value.replace(/\D/g, "");
    return numbers.length <= 11 ? maskCPF(value) : maskCNPJ(value);
}

export function maskPhone(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
}

export function maskCEP(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
}

export function buildApiError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof AxiosError) {
        const apiMessage = (error.response?.data as ApiResponse<unknown> | undefined)?.message;
        if (apiMessage) {
            return new Error(apiMessage);
        }
    }

    if (error instanceof Error) {
        return error;
    }

    return new Error(fallbackMessage);
}
