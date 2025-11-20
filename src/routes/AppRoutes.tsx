import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Products } from "@/pages/Products";
import { Customers } from "@/pages/Customers";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/products" element={<Products />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/customers" element={<Customers />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
