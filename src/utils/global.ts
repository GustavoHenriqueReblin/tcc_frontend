import { KeyboardEvent } from "react";
import { ApiResponse } from "@/types/global";
import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/config/env";

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

export function maskRG(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2")
        .replace(/(-\d{1})\d+?$/, "$1");
}

export function maskPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 10) {
        return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
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

// CPF
export function isValidCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev >= 10) rev = 0;
    if (rev !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev >= 10) rev = 0;
    return rev === parseInt(cpf[10]);
}

export function isValidCNPJ(cnpj: string) {
    cnpj = cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers[length - i]) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits[0])) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers[length - i]) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits[1]);
}

export function isValidCPFOrCNPJ(value: string) {
    const n = value.replace(/\D/g, "");
    return n.length <= 11 ? isValidCPF(value) : isValidCNPJ(value);
}

export function isValidEmail(email: string) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function nextFocus(e: KeyboardEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;

    const focusableSelectors = [
        "button:not([disabled])",
        "input:not([disabled])",
        "textarea:not([disabled])",
        "select:not([disabled])",
        "[tabindex]:not([tabindex='-1']):not([disabled])",
    ].join(",");

    const focusables = Array.from(
        document.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => el.offsetParent !== null);

    const idx = focusables.indexOf(target);

    if (idx >= 0 && idx < focusables.length - 1) {
        focusables[idx + 1].focus();
    }
}

export function toISOStartOfDay(date: Date): string {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    return d.toISOString();
}

export function toISOEndOfDay(date: Date): string {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    return d.toISOString();
}

export const formatCurrency = (value: number) => {
    return (
        "R$ " +
        Number(value).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
        })
    );
};

export const formatNumber = (value: number) => {
    return Number(value).toLocaleString("pt-BR");
};

export const formatDate = (value: Date, opts?: Intl.DateTimeFormatOptions) => {
    return value.toLocaleString("pt-BR", opts);
};

export async function openPDF(id: number, path: string) {
    const url = `${env.VITE_API_URL}/reports/${path}/${id}/pdf`;
    const response = await fetch(url, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Erro ao gerar PDF");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export function normalizeString(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export const round3 = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;
