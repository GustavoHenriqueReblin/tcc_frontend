import { Route } from "react-router-dom";
import { Unities } from "@/pages/Unity/Unities";
import { CreateUnity } from "@/pages/Unity/CreateUnity";
import { EditUnity } from "@/pages/Unity/EditUnity";

export function UnityRoutes() {
    return (
        <>
            <Route path="/unities" element={<Unities />} />
            <Route path="/unities/create" element={<CreateUnity />} />
            <Route path="/unities/edit/:id" element={<EditUnity />} />
        </>
    );
}
