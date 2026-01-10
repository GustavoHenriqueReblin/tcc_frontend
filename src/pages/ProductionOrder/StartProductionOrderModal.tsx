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
import { TextField } from "@/components/Fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    startProductionOrderSchema,
    StartProductionOrderValues,
} from "@/schemas/production-order.schema";
import { ProductionOrder } from "@/types/productionOrder";
import { cn } from "@/utils/global";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: ProductionOrder;
    onConfirm: (values: StartProductionOrderValues) => void;
    isLoading?: boolean;
}

export function StartProductionOrderModal({
    open,
    onOpenChange,
    order,
    onConfirm,
    isLoading = false,
}: Props) {
    const form = useForm<StartProductionOrderValues>({
        resolver: zodResolver(startProductionOrderSchema),
        defaultValues: {
            startDate: order.startDate ?? new Date().toISOString(),
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Iniciar ordem de produção</AlertDialogTitle>
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
                            name="startDate"
                            label="Data de inicio"
                            type="date"
                            withTime
                        />

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
                                        variant: "primary",
                                    })
                                )}
                            >
                                {isLoading ? "Iniciando..." : "Iniciar produção"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
