import { Route } from "react-router-dom";
import { Products } from "@/pages/Product/Products";
import { CreateProduct } from "@/pages/Product/CreateProduct";
import { EditProduct } from "@/pages/Product/EditProduct";

export function ProductRoutes() {
    return (
        <>
            <Route path="/products" element={<Products />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
        </>
    );
}
