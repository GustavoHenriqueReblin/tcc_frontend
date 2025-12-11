import { Button } from "@/components/ui/button";
import { Section } from "@/components/Fields";
import { RecipeFormValue } from "@/schemas/product.schema";
import { ProductRecipeModal } from "./ProductRecipeModal";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

interface Props {
    recipes: RecipeFormValue[];
    onChange: (next: RecipeFormValue[]) => void;
}

export function ProductRecipes({ recipes, onChange }: Props) {
    const [openModal, setOpenModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setOpenModal(true);
    };

    const handleDelete = (index: number) => {
        const next = [...recipes];
        next.splice(index, 1);
        onChange(next);
    };

    const handleSave = (recipe: RecipeFormValue) => {
        const next = [...recipes];

        if (editingIndex === null) {
            next.push(recipe);
        } else {
            next[editingIndex] = recipe;
        }

        onChange(next);
        setOpenModal(false);
    };

    return (
        <Section
            title="Receitas de produção"
            description="Cadastre as fórmulas utilizadas na fabricação deste produto."
        >
            <div className="flex">
                <Button
                    type="button"
                    variant="outline"
                    className="inline-flex items-center gap-2 w-fit"
                    onClick={() => {
                        setEditingIndex(null);
                        setOpenModal(true);
                    }}
                >
                    <PlusCircle className="size-4" />
                    Nova receita
                </Button>
            </div>

            <div className="flex flex-col justify-center items-center mb-2 gap-2">
                {recipes.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma receita cadastrada.</p>
                )}
            </div>

            <div className="flex flex-col gap-4 mb-2">
                {recipes.map((r, i) => (
                    <div
                        key={i}
                        className="border rounded-md p-3 flex justify-between items-center bg-secondary/40 cursor-pointer"
                        onClick={() => handleEdit(i)}
                    >
                        <div>
                            <p className="font-medium">{r.description}</p>
                            <p className="text-xs text-muted-foreground">
                                {r.items.length + (r.items.length > 1 ? " itens" : " item")}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(i)}
                            >
                                Editar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(i);
                                }}
                            >
                                Excluir
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {openModal && (
                <ProductRecipeModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    initialData={
                        editingIndex !== null
                            ? recipes[editingIndex]
                            : { id: undefined, description: "", notes: "", items: [] }
                    }
                    onSave={handleSave}
                />
            )}
        </Section>
    );
}
