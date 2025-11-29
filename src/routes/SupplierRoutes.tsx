import { Route } from "react-router-dom";
import { Suppliers } from "@/pages/Supplier/Suppliers";
import { CreateSupplier } from "@/pages/Supplier/CreateSupplier";
import { EditSupplier } from "@/pages/Supplier/EditSupplier";

export function SupplierRoutes() {
    return (
        <>
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/create" element={<CreateSupplier />} />
            <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
        </>
    );
}
