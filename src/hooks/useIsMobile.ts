import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const listener = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [breakpoint]);

    return isMobile;
}
