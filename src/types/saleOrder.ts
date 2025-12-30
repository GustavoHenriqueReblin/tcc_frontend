import { OrderStatus, ServerListWithTotals } from "./global";
import { Product } from "./product";
import { Customer } from "./customer";

export interface SaleTotals {
    subtotal: number;
    discount: number;
    otherCosts: number;
    total: number;
}

export type SaleOrderServerList<TSale> = ServerListWithTotals<TSale, SaleTotals>;

export interface SaleOrderItem {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    productUnitPrice: number;
    unitCost: number;

    product?: Product;
}

export interface SaleOrder {
    id: number;
    enterpriseId: number;
    customerId: number;
    warehouseId: number;
    code: string;
    status: OrderStatus;

    totalValue: number;
    discount: number;
    otherCosts: number;
    notes: string | null;

    createdAt: string;
    updatedAt: string;

    customer?: Customer;
    items?: SaleOrderItem[];
}
