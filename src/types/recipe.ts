import { Product } from "./product";

export interface RecipeItem {
    id: number;
    enterpriseId: number;
    recipeId: number;
    productId: number;
    quantity: number;

    createdAt: Date | string;
    updatedAt: Date | string;

    product?: Product;
}

export interface Recipe {
    id: number;
    enterpriseId: number;
    productId: number;
    description: string | null;
    notes: string | null;

    createdAt: Date | string;
    updatedAt: Date | string;

    product?: Product;
    items?: RecipeItem[];
}
