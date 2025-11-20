import type React from "react";
import { useAuth } from "../context/AuthContext";

export const Home: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="d-flex gap-1">
            <h2>Home</h2>
            <span>Bem-vindo{user?.username ? `, ${user.username}` : ""}!</span>
        </div>
    );
};
