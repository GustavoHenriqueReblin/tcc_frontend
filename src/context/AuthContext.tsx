import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type User = {
    username: string;
    [key: string]: unknown;
};

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const value: AuthContextValue = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            setUser,
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
