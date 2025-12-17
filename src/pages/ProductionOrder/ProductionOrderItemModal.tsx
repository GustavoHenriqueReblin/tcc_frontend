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

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    {initialData?.productId ? "Editar insumo" : "Adicionar insumo"}
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={handleSubmit((values) => {
                            onSave(values);
                            onClose();
                        })}
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
                                endpoint="/products/materials"
                                valueField="id"
                                labelField="name"
                                disabled={!!initialData?.productId}
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
                                suffix={initialData?.unitySimbol}
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
