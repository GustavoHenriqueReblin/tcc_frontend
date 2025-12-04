import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldsGrid, TextAreaStandalone, TextFieldStandalone } from "@/components/Fields";

import { api } from "@/api/client";
import { buildApiError } from "@/lib/utils";
import { ComboboxStandalone } from "./ComboboxStandalone";
import { ApiResponse } from "@/types/global";
import { InventoryMovement } from "@/types/inventoryMovement";

interface AdjustStockModalProps {
    productData: { id: number; quantity: number };
    open: boolean;
    onClose: () => void;
    onSuccess?: (newQuantity: number) => void;
}

export function AdjustStockModal({ productData, open, onClose, onSuccess }: AdjustStockModalProps) {
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
        <Modal open={open} onClose={onClose}>
            <h2 className="text-lg font-semibold">Ajustar estoque</h2>
            <p className="text-sm text-muted-foreground mb-4">
                Informe os dados do ajuste de estoque.
            </p>

            <FieldsGrid cols={2}>
                <TextFieldStandalone
                    autoFocus
                    label="Quantidade *"
                    type="number"
                    value={quantity}
                    onChange={(val) => {
                        const newValue = val as number;
                        setQuantity(newValue);
                        setDiference(newValue - productData.quantity);
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

            <div className="flex flex-col gap-2">
                <span>Quantidade em estoque: {productData.quantity}</span>
                <span>Diferença: {quantity !== null ? diference : ""}</span>
            </div>

            <div className="flex justify-end mt-6 gap-3">
                <Button variant="outline" onClick={onClose}>
                    Cancelar
                </Button>

                <Button
                    disabled={mutation.isPending}
                    onClick={() => {
                        if (!quantity) {
                            toast.error("Informe a quantidade.");
                            return;
                        }

                        mutation.mutate();
                    }}
                >
                    {mutation.isPending ? "Salvando..." : "Ajustar estoque"}
                </Button>
            </div>
        </Modal>
    );
}
