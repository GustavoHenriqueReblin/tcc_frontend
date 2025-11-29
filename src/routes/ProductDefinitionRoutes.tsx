import { Route } from "react-router-dom";
import { ProductDefinitions } from "@/pages/ProductDefinition/ProductDefinitions";
import { CreateProductDefinition } from "@/pages/ProductDefinition/CreateProductDefinition";
import { EditProductDefinition } from "@/pages/ProductDefinition/EditProductDefinition";

export function ProductDefinitionRoutes() {
    return (
        <>
            <Route path="/product-definitions" element={<ProductDefinitions />} />
            <Route path="/product-definitions/create" element={<CreateProductDefinition />} />
            <Route path="/product-definitions/edit/:id" element={<EditProductDefinition />} />
        </>
    );
}
