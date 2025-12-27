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

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ApiResponse, ServerList } from "@/types/global";
import { ProductDefinitionTypeEnum } from "@/types/enums";

interface Props {
    open: boolean;
    onClose: () => void;
    initialData: RecipeItemFormValue;
    onSave: (data: RecipeItemFormValue) => void;
}

interface ProductDefinition {
    id: number;
    type: string;
}

export function RecipeItemModal({ open, onClose, initialData, onSave }: Props) {
    const form = useForm<RecipeItemFormValue>({
        resolver: zodResolver(recipeItemFormSchema),
        defaultValues: initialData,
    });

    const { control, trigger, getValues } = form;
    const unitySimbol = form.watch("unitySimbol");

    const { data: rawMaterialDefinition } = useQuery<ProductDefinition>({
        queryKey: ["product-definition", ProductDefinitionTypeEnum.RAW_MATERIAL],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ServerList<ProductDefinition>>>(
                "/product-definitions",
                {
                    params: {
                        type: ProductDefinitionTypeEnum.RAW_MATERIAL,
                        limit: 1,
                    },
                }
            );

            if (!response.data.success || response.data.data.items.length === 0) {
                throw new Error("Definição de matéria-prima não encontrada");
            }

            return response.data.data.items[0];
        },
    });

    const validateAndSubmit = async () => {
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
                                endpoint="/products"
                                extraParams={
                                    rawMaterialDefinition
                                        ? { productDefinitionId: rawMaterialDefinition.id }
                                        : undefined
                                }
                                valueField="id"
                                labelField="name"
                                disabled={!rawMaterialDefinition}
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
                                suffix={unitySimbol && " " + unitySimbol}
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
