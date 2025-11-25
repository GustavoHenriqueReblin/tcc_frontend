import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Products } from "@/pages/Products";
import { Customers } from "@/pages/Customers";
import { Warehouses } from "@/pages/Warehouses";
import { ProductDefinitions } from "@/pages/ProductDefinitions";
import { Suppliers } from "@/pages/Suppliers";

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
                    <Route path="/customers" element={<Customers />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/suppliers" element={<Suppliers />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/products" element={<Products />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/warehouses" element={<Warehouses />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/product-definitions" element={<ProductDefinitions />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
