import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { MouseEvent, ReactNode } from "react";
import { cn } from "@/utils/global";

type StatusActionIntent = "primary" | "success" | "danger";
type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

interface StatusActionButtonProps {
    label: string;
    intent?: StatusActionIntent;
    confirmVariant?: ButtonVariant;
    confirmTitle: string;
    confirmDescription: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    disabled?: boolean;
    className?: string;
}

const intentToVariant: Record<StatusActionIntent, ButtonVariant> = {
    primary: "primary",
    success: "success",
    danger: "destructive",
};

export function StatusActionButton({
    label,
    intent = "primary",
    confirmVariant,
    confirmTitle,
    confirmDescription,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    disabled = false,
    className,
}: StatusActionButtonProps) {
    const stop = (e: MouseEvent) => e.stopPropagation();

    const actionVariant = intentToVariant[intent];
    const confirmButtonVariant = confirmVariant ?? actionVariant;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant={actionVariant}
                    disabled={disabled}
                    className={className}
                    onClick={stop}
                >
                    {label}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent onClick={stop}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={stop}
                        className={cn(
                            buttonVariants({ className: "cursor-pointer", variant: "outline" })
                        )}
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            stop(e);
                            onConfirm();
                        }}
                        className={cn(
                            buttonVariants({
                                className: "cursor-pointer",
                                variant: confirmButtonVariant,
                            })
                        )}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
