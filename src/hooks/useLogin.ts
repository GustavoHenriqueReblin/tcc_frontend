import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
import type { LoginResponse, User } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import type { LoginFormValues } from "../schemas/auth/login.schema";

export const useLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    const mutation = useMutation({
        mutationFn: async (payload: LoginFormValues): Promise<User> => {
            const response = await api.post<LoginResponse>("/auth/login", payload);

            if (!response.data.success) {
                throw new Error(response.data.message || "Erro ao autenticar");
            }

            return response.data.data.user;
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
        error: mutation.error as Error | null,
        reset: mutation.reset,
    };
};
