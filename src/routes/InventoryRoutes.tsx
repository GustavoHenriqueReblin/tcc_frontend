import { Route } from "react-router-dom";
import { InboundEntry } from "@/pages/Inbound/Inbound";
import { InventoryMovementPage } from "@/pages/InventoryMovement/InventoryMovement";

export function InventoryRoutes() {
    return (
        <>
            <Route path="/inventory/inbound" element={<InboundEntry />} />
            <Route path="/inventory/movements" element={<InventoryMovementPage />} />
        </>
    );
}
