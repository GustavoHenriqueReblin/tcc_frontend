import * as React from "react";
import { cn } from "@/lib/utils";

export function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    React.useEffect(() => {
        if (!open) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    React.useEffect(() => {
        if (!open) return;

        window.history.pushState({ modal: true }, "");

        const handlePopState = () => {
            onClose();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);

            if (window.history.state?.modal) {
                window.history.back();
            }
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div
                className={cn(
                    "relative z-50 bg-card border rounded-lg shadow-lg w-full max-w-lg p-6"
                )}
            >
                {children}
            </div>
        </div>
    );
}
