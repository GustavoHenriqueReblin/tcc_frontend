import { Route } from "react-router-dom";
import { ProductionOrders } from "@/pages/ProductionOrder/ProductionOrders";
import { CreateProductionOrder } from "@/pages/ProductionOrder/CreateProductionOrder";
import { EditProductionOrder } from "@/pages/ProductionOrder/EditProductionOrder";

export function ProductionOrderRoutes() {
    return (
        <>
            <Route path="/production-orders" element={<ProductionOrders />} />
            <Route path="/production-orders/create" element={<CreateProductionOrder />} />
            <Route path="/production-orders/edit/:id" element={<EditProductionOrder />} />
        </>
    );
}
