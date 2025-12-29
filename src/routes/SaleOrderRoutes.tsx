import { Route } from "react-router-dom";

import { SaleOrders } from "@/pages/SaleOrder/SaleOrders";
import { CreateSaleOrder } from "@/pages/SaleOrder/CreateSaleOrder";
import { EditSaleOrder } from "@/pages/SaleOrder/EditSaleOrder";

export function SaleOrderRoutes() {
    return (
        <>
            <Route path="/sale-orders" element={<SaleOrders />} />
            <Route path="/sale-orders/create" element={<CreateSaleOrder />} />
            <Route path="/sale-orders/edit/:id" element={<EditSaleOrder />} />
        </>
    );
}
