import { useState } from "react";

import { SimpleSelect } from "@/components/Fields";

import { usePageTitle } from "@/hooks/usePageTitle";
import { MovementSourceEnum } from "@/types/enums";
import { MovementSource, movementSourceLabels } from "@/types/global";

import { PurchaseEntryForm } from "./PurchaseEntryForm";
import { AdjustmentEntryForm } from "./AdjustmentEntryForm";
import { HarvestForm } from "./HarvestForm";

export function InboundEntry() {
    usePageTitle("Entrada de Mercadoria - ERP industrial");
    const [type, setType] = useState<MovementSource>(MovementSourceEnum.PURCHASE);

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Entrada de mercadoria</h2>
                <p className="text-sm text-muted-foreground">
                    Selecione o tipo de entrada que deseja registrar.
                </p>
            </div>

            <div className="max-w-sm">
                <SimpleSelect
                    value={type}
                    onChange={(val) => setType(val as MovementSource)}
                    placeholder="Tipo da entrada"
                    options={[
                        {
                            value: MovementSourceEnum.PURCHASE,
                            label: movementSourceLabels.PURCHASE,
                        },
                        {
                            value: MovementSourceEnum.ADJUSTMENT,
                            label: movementSourceLabels.ADJUSTMENT,
                        },
                        {
                            value: MovementSourceEnum.HARVEST,
                            label: movementSourceLabels.HARVEST,
                        },
                    ]}
                />
            </div>

            {type === MovementSourceEnum.PURCHASE && <PurchaseEntryForm />}
            {type === MovementSourceEnum.ADJUSTMENT && <AdjustmentEntryForm />}
            {type === MovementSourceEnum.HARVEST && <HarvestForm />}
        </div>
    );
}
