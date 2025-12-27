import { Route } from "react-router-dom";
import { Products } from "@/pages/Product/Products";
import { CreateProduct } from "@/pages/Product/CreateProduct";
import { EditProduct } from "@/pages/Product/EditProduct";
import { RawMaterials } from "@/pages/Product/RawMaterials";

export function ProductRoutes() {
    return (
        <>
            <Route path="/raw-material" element={<RawMaterials />} />
            <Route path="/raw-material/create" element={<CreateProduct />} />
            <Route path="/raw-material/edit/:id" element={<EditProduct />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
        </>
    );
}
