import * as React from "react";
import { cn, nextFocus } from "@/utils/global";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function TextareaInner(
    { className, ...props }: TextareaProps,
    ref: React.ForwardedRef<HTMLTextAreaElement>
) {
    return (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onKeyDown={(e) => {
                if (e.key === "Enter") nextFocus(e);
            }}
            {...props}
        />
    );
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(TextareaInner);

export { Textarea };
