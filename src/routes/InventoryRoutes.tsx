import { Route } from "react-router-dom";
import { InboundEntry } from "@/pages/inbound/Inbound";

export function InventoryRoutes() {
    return (
        <>
            <Route path="/inventory/inbound" element={<InboundEntry />} />
        </>
    );
}
