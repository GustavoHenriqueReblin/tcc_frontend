import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { TextField, FieldsGrid, Section } from "@/components/Fields";

import { RecipeFormValue, recipeFormSchema, RecipeItemFormValue } from "@/schemas/product.schema";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { RecipeItemModal } from "./RecipeItemModal";
import { PlusCircle } from "lucide-react";
import { Form } from "@/components/ui/form";
import { formatNumber } from "@/utils/global";

interface Props {
    open: boolean;
    onClose: () => void;
    initialData: RecipeFormValue;
    onSave: (data: RecipeFormValue) => void;
}

export function ProductRecipeModal({ open, onClose, initialData, onSave }: Props) {
    const form = useForm<RecipeFormValue>({
        resolver: zodResolver(recipeFormSchema),
        defaultValues: initialData,
    });

    const { control, trigger, getValues, setValue } = form;

    const [items, setItems] = useState<RecipeItemFormValue[]>(initialData.items ?? []);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RecipeItemFormValue | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const openNewItem = () => {
        setEditingItem({
            id: undefined,
            productId: 0,
            quantity: 0,
            productName: "",
            unitySimbol: "",
        });
        setEditingIndex(null);
        setItemModalOpen(true);
    };

    const openEditItem = (index: number) => {
        setEditingItem(items[index]);
        setEditingIndex(index);
        setItemModalOpen(true);
    };

    const saveItem = (item: RecipeItemFormValue) => {
        const next = [...items];

        if (editingIndex === null) next.push(item);
        else next[editingIndex] = item;

        setItems(next);
    };

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const validateAndSubmit = async () => {
        setValue("items", items);
        const isValid = await trigger(undefined, { shouldFocus: true });

        if (!isValid) {
            console.group("VALIDATION FAILED");
            console.log("Values:", getValues());
            console.log("Errors:", form.formState.errors);
            console.groupEnd();
            return;
        }

        onSave(getValues());
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData?.id ? "Editar receita" : "Nova receita"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <div className="flex flex-col gap-6">
                        <Section title="Informações" description="Dados principais da receita">
                            <FieldsGrid cols={1}>
                                <TextField
                                    control={control}
                                    name="description"
                                    label="Descrição *"
                                />
                                <TextField control={control} name="notes" label="Observações" />
                            </FieldsGrid>
                        </Section>

                        <Section title="Itens" description="Materiais utilizados na receita">
                            <div className="flex mb-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex items-center gap-2 w-fit"
                                    onClick={openNewItem}
                                >
                                    <PlusCircle className="size-4" />
                                    Adicionar item
                                </Button>
                            </div>

                            {items.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum item adicionado.
                                </p>
                            )}

                            <div className="flex flex-col gap-2">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-md p-3 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Quantidade: {formatNumber(item.quantity)}
                                                {item.unitySimbol}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                type="button"
                                                onClick={() => openEditItem(index)}
                                            >
                                                Editar
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        type="button"
                                                    >
                                                        Excluir
                                                    </Button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Excluir item?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Deseja
                                                            realmente excluir este item da receita?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>

                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="cursor-pointer">
                                                            Cancelar
                                                        </AlertDialogCancel>

                                                        <AlertDialogAction
                                                            className="bg-destructive cursor-pointer"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            Confirmar exclusão
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <DialogFooter className="mt-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>

                            <Button type="button" onClick={validateAndSubmit}>
                                Salvar receita
                            </Button>
                        </DialogFooter>
                    </div>
                </Form>
            </DialogContent>

            {itemModalOpen && editingItem && (
                <RecipeItemModal
                    open={itemModalOpen}
                    onClose={() => setItemModalOpen(false)}
                    initialData={editingItem}
                    onSave={saveItem}
                />
            )}
        </Dialog>
    );
}
