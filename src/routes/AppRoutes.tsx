import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Warehouses } from "@/pages/Warehouses";
import { ProductDefinitions } from "@/pages/ProductDefinitions";
import { Unities } from "@/pages/Unities";
import { CustomerRoutes } from "./CustomerRoutes";
import { SupplierRoutes } from "./SupplierRoutes";
import { ProductRoutes } from "./ProductRoutes";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />

                    {CustomerRoutes()}
                    {SupplierRoutes()}
                    {ProductRoutes()}
                    <Route path="/unities" element={<Unities />} />
                    <Route path="/warehouses" element={<Warehouses />} />
                    <Route path="/product-definitions" element={<ProductDefinitions />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
