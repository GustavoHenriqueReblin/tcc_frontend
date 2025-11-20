import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Loading";
import { ApiResponse } from "@/types/global";
import { User } from "@/types/auth";

export function ProtectedRoute() {
    const location = useLocation();
    const { setUser } = useAuth();

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
        if (data?.success && data.data) {
            setUser(data.data);
        }
    }, [data, setUser]);

    if (isError) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.success || !data.data) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
