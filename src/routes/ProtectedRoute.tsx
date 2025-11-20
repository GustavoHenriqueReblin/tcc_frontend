import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Loading";
import { ApiResponse } from "@/types/global";
import { User } from "@/types/auth";
import { AppLayout } from "@/layout/AppLayout";

export function ProtectedRoute() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, setUser } = useAuth();

    const { data, isLoading, isError } = useQuery<ApiResponse<User>>({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const response = await api.get<ApiResponse<User>>("/auth/me");
            return response.data;
        },
        staleTime: 0,
        refetchOnMount: "always",
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const validateUser = async () => {
            if (isLoading) return;

            if (!data?.success || !data.data) {
                await logout();
                navigate("/login", { replace: true });
            }

            setUser(data.data);
        };
        validateUser();
    }, [data, setUser, isLoading, logout, navigate]);

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
