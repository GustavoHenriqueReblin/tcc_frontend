import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Loading";
import { ApiResponse } from "@/types/global";
import { Me } from "@/types/auth";
import { AppLayout } from "@/layout/AppLayout";

export function ProtectedRoute() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, setUser } = useAuth();

    const { data, isLoading, isError } = useQuery<ApiResponse<Me>>({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Me>>("/auth/me");
            return response.data;
        },
        staleTime: 0,
        refetchOnMount: "always",
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (isLoading) return;

        if (!data?.success || !data.data) {
            logout();
            navigate("/login", { replace: true });
            return;
        }

        const me = data.data.user;

        setUser({
            id: me.id,
            username: me.username,
            role: me.role,
            status: me.status,
            personName: me.person.name,
            enterpriseName: me.enterprise.name,
        });
    }, [data, isLoading, logout, navigate, setUser]);

    if (isError) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.success || !data.data) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <AppLayout />;
}
