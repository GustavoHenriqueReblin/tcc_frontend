import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextField, TextAreaField } from "@/components/Fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    finishProductionOrderSchema,
    FinishProductionOrderValues,
} from "@/schemas/production-order.schema";
import { ProductionOrder } from "@/types/productionOrder";
import { cn } from "@/utils/global";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: ProductionOrder;
    onConfirm: (values: FinishProductionOrderValues) => void;
    isLoading?: boolean;
}

export function FinishProductionOrderModal({
    open,
    onOpenChange,
    order,
    onConfirm,
    isLoading = false,
}: Props) {
    const form = useForm<FinishProductionOrderValues>({
        resolver: zodResolver(finishProductionOrderSchema),
        defaultValues: {
            producedQty: order.plannedQty,
            wasteQty: null,
            endDate: new Date().toISOString(),
            notes: null,
        },
    });

    const unitySimbol = order.recipe.product?.unity?.simbol;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Finalizar ordem de produção</AlertDialogTitle>
                </AlertDialogHeader>

                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(
                            (values) => {
                                onConfirm(values);
                            },
                            (errors) => {
                                console.error("FORM ERRORS", errors);
                                console.log("CURRENT VALUES", form.getValues());
                            }
                        )}
                    >
                        <TextField
                            control={form.control}
                            name="producedQty"
                            label="Quantidade produzida"
                            type="number"
                            decimals={3}
                            suffix={unitySimbol ? ` ${unitySimbol}` : undefined}
                        />

                        <TextField
                            control={form.control}
                            name="wasteQty"
                            label="Perda"
                            type="number"
                            decimals={3}
                            suffix={unitySimbol ? ` ${unitySimbol}` : undefined}
                        />

                        <TextField
                            control={form.control}
                            name="endDate"
                            label="Data de término"
                            type="date"
                        />

                        <TextAreaField control={form.control} name="notes" label="Observações" />

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Cancelar
                            </AlertDialogCancel>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    buttonVariants({
                                        className: "cursor-pointer",
                                        variant: "success",
                                    })
                                )}
                            >
                                {isLoading ? "Finalizando..." : "Finalizar produção"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
