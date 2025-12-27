import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TextField, FieldsGrid } from "@/components/Fields";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    productionOrderInputSchema,
    ProductionOrderInputValues,
} from "@/schemas/production-order.schema";
import { Form } from "@/components/ui/form";
import { ComboboxQuery } from "@/components/ComboboxQuery";
import { ProductDefinition } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { ProductDefinitionTypeEnum } from "@/types/enums";
import { api } from "@/api/client";
import { ApiResponse, ServerList } from "@/types/global";

interface Props {
    open: boolean;
    onClose: () => void;
    initialData: ProductionOrderInputValues;
    onSave: (data: ProductionOrderInputValues) => void;
}

export function ProductionOrderItemModal({ open, onClose, initialData, onSave }: Props) {
    const form = useForm<ProductionOrderInputValues>({
        resolver: zodResolver(productionOrderInputSchema),
        defaultValues: initialData,
    });

    const { control, handleSubmit } = form;

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

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {initialData?.productId ? "Editar insumo" : "Adicionar insumo"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(
                            (values) => {
                                onClose();
                                onSave(values);
                            },
                            (errors) => {
                                console.error("FORM ERRORS", errors);
                                console.log("CURRENT VALUES", form.getValues());
                            }
                        )}
                        className="space-y-4"
                    >
                        <FieldsGrid cols={1}>
                            <ComboboxQuery<
                                ProductionOrderInputValues,
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
                                disabled={!!initialData?.productId}
                                onSelectItem={(item) => {
                                    form.setValue("productName", item.name);
                                    form.setValue("unitySimbol", item.unity.simbol);
                                    form.setValue("unitCost", initialData.unitCost ?? 0);
                                }}
                            />

                            <TextField
                                control={control}
                                name="quantity"
                                label="Quantidade *"
                                type="number"
                                decimals={3}
                                suffix={initialData?.unitySimbol}
                            />

                            <TextField
                                control={control}
                                name="unitCost"
                                label="Custo unitário *"
                                type="number"
                                decimals={3}
                                prefix="R$ "
                            />
                        </FieldsGrid>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>

                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
