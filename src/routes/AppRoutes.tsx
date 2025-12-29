import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { CustomerRoutes } from "./CustomerRoutes";
import { SupplierRoutes } from "./SupplierRoutes";
import { ProductRoutes } from "./ProductRoutes";
import { ProductDefinitionRoutes } from "./ProductDefinitionRoutes";
import { UnityRoutes } from "./UnityRoutes";
import { WarehouseRoutes } from "./WarehouseRoutes";
import { InventoryRoutes } from "./InventoryRoutes";
import { ProductionOrderRoutes } from "./ProductionOrderRoutes";
import { SaleOrderRoutes } from "./SaleOrderRoutes";

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
                    {ProductDefinitionRoutes()}
                    {UnityRoutes()}
                    {WarehouseRoutes()}
                    {InventoryRoutes()}
                    {ProductionOrderRoutes()}
                    {SaleOrderRoutes()}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
