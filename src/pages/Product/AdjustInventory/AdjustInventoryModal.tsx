import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldsGrid, TextAreaStandalone, TextFieldStandalone } from "@/components/Fields";

import { api } from "@/api/client";
import { buildApiError } from "@/utils/global";
import { ComboboxStandalone } from "../../../components/ComboboxStandalone";
import { ApiResponse } from "@/types/global";
import { InventoryMovement } from "@/types/inventoryMovement";
import { useIsMobile } from "@/hooks/useIsMobile";

interface AdjustInventoryModalProps {
    productData: { id: number; quantity: number };
    open: boolean;
    onClose: () => void;
    onSuccess?: (newQuantity: number) => void;
}

export function AdjustInventoryModal({
    productData,
    open,
    onClose,
    onSuccess,
}: AdjustInventoryModalProps) {
    const isMobile = useIsMobile();
    const [diference, setDiference] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [warehouseId, setWarehouseId] = useState<number | null>(null);
    const [notes, setNotes] = useState<string>("");

    const mutation = useMutation({
        mutationFn: async () => {
            const toastId = toast.loading("Registrando ajuste...");

            try {
                const result = await api.post<ApiResponse<InventoryMovement>>(
                    "/inventory-movement/adjustments",
                    {
                        productId: productData.id,
                        quantity,
                        warehouseId,
                        notes: notes.trim() || null,
                    }
                );

                toast.success("Ajuste registrado com sucesso!", { id: toastId });

                onSuccess?.(result.data.data.balance);
                onClose();
            } catch (err) {
                toast.error("Falha ao registrar ajuste.", { id: toastId });
                throw buildApiError(err, "Erro ao registrar ajuste de estoque.");
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader className="mb-2">
                    <DialogTitle>Ajustar estoque</DialogTitle>
                </DialogHeader>

                <div>
                    <FieldsGrid cols={2}>
                        <TextFieldStandalone
                            autoFocus={!isMobile}
                            label="Quantidade *"
                            type="number"
                            value={quantity}
                            onChange={(val) => {
                                const newValue = Number(val ?? 0) as number;
                                setQuantity(newValue);
                                setDiference(newValue - Number(productData.quantity ?? 0));
                            }}
                        />

                        <div className="flex flex-col gap-2">
                            <ComboboxStandalone
                                label="Depósito"
                                endpoint="/warehouses"
                                valueField="id"
                                labelField="name"
                                value={warehouseId}
                                onChange={(val) => setWarehouseId(val)}
                            />
                        </div>
                    </FieldsGrid>

                    <TextAreaStandalone
                        label="Observações"
                        value={notes}
                        onChange={(val) => setNotes(val)}
                    />

                    <div className="flex flex-col gap-1 text-sm">
                        <span>Quantidade atual: {productData.quantity}</span>
                        <span>Diferença: {quantity !== null ? diference : ""}</span>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button
                        disabled={mutation.isPending}
                        onClick={() => {
                            if (quantity === null) {
                                toast.error("Informe a quantidade.");
                                return;
                            }

                            mutation.mutate();
                        }}
                    >
                        {mutation.isPending ? "Salvando..." : "Ajustar estoque"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
