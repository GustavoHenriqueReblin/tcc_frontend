import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "../api/client";
import type { LoginResponse, User } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import type { LoginFormValues } from "../schemas/auth/login.schema";

type UseLoginResult = {
    login: (payload: LoginFormValues) => void;
    loginAsync: (payload: LoginFormValues) => Promise<User>;
    isLoading: boolean;
    error: Error | null;
    errorMessage: string | null;
    reset: () => void;
};

export const useLogin = (): UseLoginResult => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    const mutation = useMutation<User, Error, LoginFormValues>({
        mutationFn: async (payload: LoginFormValues): Promise<User> => {
            try {
                const response = await api.post<LoginResponse>("/auth/login", payload);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Erro ao autenticar");
                }

                return response.data.data.user;
            } catch (err) {
                const axiosError = err as AxiosError<LoginResponse>;
                const message =
                    axiosError.response?.data?.message ??
                    axiosError.message ??
                    "Erro ao autenticar";

                throw new Error(message);
            }
        },
        onSuccess: (user) => {
            setUser(user);
            navigate(location.state?.from?.pathname ?? "/", { replace: true });
        },
    });

    return {
        login: mutation.mutate,
        loginAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        error: mutation.error,
        errorMessage: mutation.error?.message ?? null,
        reset: mutation.reset,
    };
};
