import { Route } from "react-router-dom";
import { Warehouses } from "@/pages/Warehouse/Warehouses";
import { CreateWarehouse } from "@/pages/Warehouse/CreateWarehouse";
import { EditWarehouse } from "@/pages/Warehouse/EditWarehouse";

export function WarehouseRoutes() {
    return (
        <>
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/warehouses/create" element={<CreateWarehouse />} />
            <Route path="/warehouses/edit/:id" element={<EditWarehouse />} />
        </>
    );
}
