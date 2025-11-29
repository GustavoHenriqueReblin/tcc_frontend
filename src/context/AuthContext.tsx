import { createContext, useContext, useState, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import type { LoginFormValues } from "../schemas/login.schema";
import type { LoginResponse, LogoutResponse, User } from "../types/auth";
import { api } from "../api/client";
import { AxiosError } from "axios";

type AuthContextValue = {
    user: User | null;
    setUser: (user: User) => void;
    isAuthenticated: boolean;
    login: (payload: LoginFormValues) => Promise<User>;
    logout: () => Promise<string>;
    isLoading: boolean;
    errorMessage: string | null;
    resetLogin: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mutationLogin = useMutation<User, Error, LoginFormValues>({
        mutationFn: async (payload) => {
            const response = await api.post<LoginResponse>("/auth/login", payload);

            if (!response.data.success) {
                throw new Error(response.data.message || "Erro ao autenticar");
            }

            return response.data.data.user;
        },
        onSuccess: (user) => {
            setUser(user);
        },
        onError: (error: AxiosError<LoginResponse>) => {
            setError(error.response.data.message);
        },
    });

    const mutationLogout = useMutation<string, Error>({
        mutationFn: async () => {
            const response = await api.post<LogoutResponse>("/auth/logout");

            if (!response.data.success) {
                throw new Error(response.data.message || "Erro ao desconectar");
            }

            return response.data.data.message;
        },
        onSuccess: () => {
            setUser(null);
        },
        onError: (error: AxiosError<LogoutResponse>) => {
            setError(error.response.data.message);
        },
    });

    const value: AuthContextValue = {
        user,
        setUser,
        isAuthenticated: Boolean(user),
        login: mutationLogin.mutateAsync,
        logout: mutationLogout.mutateAsync,
        isLoading: mutationLogin.isPending || mutationLogout.isPending,
        errorMessage: error,
        resetLogin: mutationLogin.reset,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
