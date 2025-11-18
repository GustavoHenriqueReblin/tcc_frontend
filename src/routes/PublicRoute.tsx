import type React from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import { api, type ApiResponse } from "../api/client";
import { useAuth, type User } from "../context/AuthContext";
import { Loading } from "../components/Loading";

export const PublicRoute: React.FC = () => {
    const { isAuthenticated, setUser } = useAuth();

    const { data, isLoading } = useQuery<ApiResponse<User>>({
        queryKey: ["auth", "me", "public"],
        queryFn: async () => {
            const response = await api.get<ApiResponse<User>>("/auth/me");
            return response.data;
        },
        enabled: !isAuthenticated,
        staleTime: 0,
        refetchOnMount: "always",
    });

    useEffect(() => {
        if (data?.success && data.data) {
            setUser(data.data);
        }
    }, [data, setUser]);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return <Loading />;
    }

    return <Outlet />;
};
