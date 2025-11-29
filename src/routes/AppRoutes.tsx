import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Products } from "@/pages/Products";
import { Warehouses } from "@/pages/Warehouses";
import { ProductDefinitions } from "@/pages/ProductDefinitions";
import { Unities } from "@/pages/Unities";
import { CustomerRoutes } from "./CustomerRoutes";
import { SupplierRoutes } from "./SupplierRoutes";

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
                    <Route path="/products" element={<Products />} />
                    <Route path="/unities" element={<Unities />} />
                    <Route path="/warehouses" element={<Warehouses />} />
                    <Route path="/product-definitions" element={<ProductDefinitions />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
