import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import {
    format,
    startOfToday,
    endOfToday,
    subDays,
    startOfMonth,
    endOfMonth,
    subMonths,
    isSameDay,
    startOfDay,
    endOfDay,
} from "date-fns";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/utils/global";

const presets: {
    label: string;
    getRange: () => DateRange;
}[] = [
    {
        label: "Ontem",
        getRange: () => {
            const d = subDays(new Date(), 1);
            return { from: d, to: d };
        },
    },
    {
        label: "Hoje",
        getRange: () => ({
            from: startOfToday(),
            to: endOfToday(),
        }),
    },
    {
        label: "Este mês",
        getRange: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
    },
    {
        label: "Mês passado",
        getRange: () => {
            const d = subMonths(new Date(), 1);
            return {
                from: startOfMonth(d),
                to: endOfMonth(d),
            };
        },
    },
    {
        label: "Últimos 7 dias",
        getRange: () => ({
            from: subDays(new Date(), 6),
            to: new Date(),
        }),
    },
    {
        label: "Últimos 30 dias",
        getRange: () => ({
            from: subDays(new Date(), 29),
            to: new Date(),
        }),
    },
];

function isPresetActive(value: DateRange | undefined, presetRange: DateRange): boolean {
    if (!value?.from || !value?.to) return false;
    if (!presetRange.from || !presetRange.to) return false;

    return isSameDay(value.from, presetRange.from) && isSameDay(value.to, presetRange.to);
}

export function DateRangePicker({
    value,
    onChange,
    showLabel = true,
}: {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    showLabel?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [draftRange, setDraftRange] = useState<DateRange | undefined>(value);

    function handleOpenChange(next: boolean) {
        if (next) {
            setDraftRange(value);
        }
        setOpen(next);
    }

    function normalizeRange(range: DateRange): DateRange {
        if (!range.from || !range.to) return range;

        return {
            from: startOfDay(range.from),
            to: endOfDay(range.to),
        };
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            {showLabel && <Label className="mb-2">Período</Label>}

            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full">
                    <CalendarIcon className="h-4 w-4" />
                    {value?.from && value?.to ? (
                        <>
                            {format(value.from, "dd/MM/yyyy")} – {format(value.to, "dd/MM/yyyy")}
                        </>
                    ) : (
                        <span>Selecione o período</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                side="bottom"
                sideOffset={8}
                className="
                    p-0
                    bg-popover
                    border
                    shadow-lg
                    rounded-md
                    w-[760px]
                    max-w-[90vw]
                    overflow-hidden
                "
            >
                <div className="flex h-full">
                    <div className="w-44 border-r bg-muted/40 p-2 flex flex-col gap-1">
                        {presets.map((preset) => {
                            const presetRange = normalizeRange(preset.getRange());
                            const active = isPresetActive(value, presetRange);

                            return (
                                <Button
                                    key={preset.label}
                                    variant={active ? "secondary" : "ghost"}
                                    className={cn(
                                        "justify-start",
                                        active && "bg-primary/10 text-primary hover:bg-primary/15"
                                    )}
                                    onClick={() => {
                                        setDraftRange(presetRange);
                                        onChange(presetRange);
                                        setOpen(false);
                                    }}
                                >
                                    {preset.label}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="p-2">
                        <Calendar
                            mode="range"
                            locale={ptBR}
                            numberOfMonths={2}
                            selected={draftRange}
                            onSelect={(range) => {
                                setDraftRange(range);

                                if (!range?.from || !range?.to) return;

                                const normalized = normalizeRange(range);
                                onChange(normalized);
                                setOpen(false);
                            }}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
