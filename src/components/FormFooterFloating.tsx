import { ReactNode, useEffect, useRef, useState } from "react";

interface FloatingFooterProps {
    children: ReactNode;
    targetId: string;
    rightOffset?: number;
}

export function FormFooterFloating({ children, targetId, rightOffset = 16 }: FloatingFooterProps) {
    const [shouldShow, setShouldShow] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const target = document.getElementById(targetId);
        if (!target) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const isVisible = entries[0].isIntersecting;
                setShouldShow(!isVisible);
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(target);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [targetId]);

    if (!shouldShow) return null;

    return (
        <div
            className="
                fixed bottom-4 
                z-50
                bg-card 
                border border-border 
                shadow-lg 
                rounded-md
                px-4 py-3
            "
            style={{
                right: rightOffset,
            }}
        >
            <div className="flex items-center gap-3">{children}</div>
        </div>
    );
}
