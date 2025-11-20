import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Loading";
import { ApiResponse } from "@/types/global";
import { User } from "@/types/auth";

export function PublicRoute() {
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
        retry: false,
        refetchOnWindowFocus: false,
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
}
