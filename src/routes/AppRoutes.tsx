import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { Products } from "@/pages/Products";
import { Warehouses } from "@/pages/Warehouses";
import { ProductDefinitions } from "@/pages/ProductDefinitions";
import { Suppliers } from "@/pages/Suppliers";
import { Unities } from "@/pages/Unities";
import { CustomerRoutes } from "./CustomerRoutes";

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

                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/unities" element={<Unities />} />
                    <Route path="/warehouses" element={<Warehouses />} />
                    <Route path="/product-definitions" element={<ProductDefinitions />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
