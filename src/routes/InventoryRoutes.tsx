import { Route } from "react-router-dom";
import { InboundEntry } from "@/pages/Inbound/Inbound";

export function InventoryRoutes() {
    return (
        <>
            <Route path="/inventory/inbound" element={<InboundEntry />} />
        </>
    );
}
