import { MovementSource, MovementType } from "./global";
import { Product } from "./product";
import { Supplier } from "./supplier";
import { Warehouse } from "./warehouse";

export interface InventoryMovement {
    id: number;
    enterpriseId: number;
    productId: number;
    warehouseId: number;
    lotId: number | null;
    direction: MovementType;
    source: MovementSource;
    quantity: number;
    balance: number;
    unitCost: number | null;
    reference: string | null;
    notes: string | null;
    supplierId: number | null;
    createdAt: string;
    updatedAt: string;

    product?: Product;
    warehouse?: Warehouse;
    supplier?: Supplier;
}
