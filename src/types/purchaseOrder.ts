import { OrderStatus } from "./global";
import { Product } from "./product";
import { Supplier } from "./supplier";

export interface PurchaseOrderItem {
    id: number;
    productId: number;
    quantity: number;
    unitCost: number;

    product?: Product;
}

export interface PurchaseOrder {
    id: number;
    enterpriseId: number;
    supplierId: number;
    code: string;
    status: OrderStatus;
    notes: string | null;

    createdAt: string;
    updatedAt: string;

    supplier?: Supplier;
    items?: PurchaseOrderItem[];
}
