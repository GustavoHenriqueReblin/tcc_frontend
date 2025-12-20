import { Product } from "./product";

export interface RecipeItem {
    id: number;
    enterpriseId: number;
    recipeId: number;
    productId: number;
    quantity: number;

    createdAt: string;
    updatedAt: string;

    product?: Product;
}

export interface Recipe {
    id: number;
    enterpriseId: number;
    productId: number;
    description: string | null;
    notes: string | null;

    createdAt: string;
    updatedAt: string;

    product?: Product;
    items?: RecipeItem[];
}
