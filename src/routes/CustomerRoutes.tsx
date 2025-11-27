import { Route } from "react-router-dom";
import { Customers } from "@/pages/Customer/Customers";
import { CreateCustomer } from "@/pages/Customer/CreateCustomer";
import { EditCustomer } from "@/pages/Customer/EditCustomer";

export function CustomerRoutes() {
    return (
        <>
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            <Route path="/customers/edit/:id" element={<EditCustomer />} />
        </>
    );
}
