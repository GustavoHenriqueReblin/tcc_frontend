import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TextField, FieldsGrid } from "@/components/Fields";
import { ComboboxQuery } from "@/components/ComboboxQuery";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeItemFormSchema, RecipeItemFormValue } from "@/schemas/product.schema";
import { Form } from "@/components/ui/form";

interface Props {
    open: boolean;
    onClose: () => void;
    initialData: RecipeItemFormValue;
    onSave: (data: RecipeItemFormValue) => void;
}

export function RecipeItemModal({ open, onClose, initialData, onSave }: Props) {
    const form = useForm<RecipeItemFormValue>({
        resolver: zodResolver(recipeItemFormSchema),
        defaultValues: initialData,
    });

    const { control, trigger, getValues } = form;

    const validateAndSubmit = async () => {
        const isValid = await trigger(undefined, { shouldFocus: true });

        if (!isValid) {
            console.group("VALIDATION FAILED");
            console.log("Values:", getValues());
            console.log("Errors:", form.formState.errors);
            console.groupEnd();
            return;
        }

        submit(getValues());
    };

    const submit = (data: RecipeItemFormValue) => {
        onSave(data);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData.id ? "Editar item" : "Adicionar item"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <div className="space-y-4">
                        <FieldsGrid cols={1}>
                            <ComboboxQuery<
                                RecipeItemFormValue,
                                {
                                    id: number;
                                    name: string;
                                    unity: { simbol: string };
                                }
                            >
                                control={control}
                                name="productId"
                                label="Matéria prima *"
                                endpoint="/products/materials"
                                valueField="id"
                                labelField="name"
                                onSelectItem={(item) => {
                                    form.setValue("productName", item.name);
                                    form.setValue("unitySimbol", item.unity.simbol);
                                }}
                            />

                            <TextField
                                control={control}
                                name="quantity"
                                label="Quantidade *"
                                type="number"
                                decimals={3}
                            />
                        </FieldsGrid>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>

                            <Button type="button" onClick={validateAndSubmit}>
                                Salvar
                            </Button>
                        </DialogFooter>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
