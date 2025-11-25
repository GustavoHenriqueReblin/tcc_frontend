import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Loading";
import { ApiResponse } from "@/types/global";
import { Me } from "@/types/auth";

export function PublicRoute() {
    const { isAuthenticated, setUser } = useAuth();

    const { data, isLoading } = useQuery<ApiResponse<Me>>({
        queryKey: ["auth", "me", "public"],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Me>>("/auth/me");
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
            const me = data.data.user;

            setUser({
                id: me.id,
                username: me.username,
                role: me.role,
                status: me.status,
                personName: me.person.name,
                enterpriseName: me.enterprise.name,
            });
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
