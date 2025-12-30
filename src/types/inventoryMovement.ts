import { MovementSource, MovementType } from "./global";
import { Product } from "./product";
import { ProductionOrder } from "./productionOrder";
import { PurchaseOrder } from "./purchaseOrder";
import { SaleOrder } from "./saleOrder";
import { Warehouse } from "./warehouse";

export interface InventoryMovement {
    id: number;
    enterpriseId: number;
    productId: number;
    warehouseId: number;
    lotId: number | null;
    productionOrderId?: number | null;
    purchaseOrderId?: number | null;
    saleOrderId?: number | null;
    direction: MovementType;
    source: MovementSource;
    quantity: number;
    balance: number;
    unitCost: number | null;
    saleValue: number | null;
    reference: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;

    product?: Product;
    warehouse?: Warehouse;
    productionOrder?: ProductionOrder;
    purchaseOrder?: PurchaseOrder;
    saleOrder?: SaleOrder;
}
