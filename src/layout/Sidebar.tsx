import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const menuItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Produtos", to: "/produtos", icon: Package },
    { label: "Clientes", to: "/clientes", icon: Users },
];

export function Sidebar({
    mode,
    open,
    onClose,
}: {
    mode: "mobile-overlay" | "desktop-expanded" | "desktop-collapsed";
    open: boolean;
    onClose: () => void;
}) {
    const location = useLocation();

    const width = mode === "desktop-collapsed" ? "w-20" : "w-60";

    const baseClasses = cn(
        "flex flex-col bg-background border-r transition-all duration-300",
        width
    );

    const mobileOverlayClasses = cn(
        "fixed inset-y-0 left-0 w-60 bg-background border-r shadow-xl z-50 transform transition-transform",
        open ? "translate-x-0" : "-translate-x-64"
    );

    const isMobile = mode === "mobile-overlay";

    return (
        <>
            <aside className={isMobile ? mobileOverlayClasses : baseClasses}>
                <div className={cn("px-5 py-4", mode === "desktop-collapsed" && "px-2")}>
                    <h1
                        className={cn(
                            "text-lg font-semibold tracking-tight transition",
                            mode === "desktop-collapsed" && "scale-0 h-0 opacity-0"
                        )}
                    >
                        ERP Industrial
                    </h1>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const active = location.pathname.startsWith(item.to);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={isMobile ? onClose : undefined}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                                    active
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon />

                                <span
                                    className={cn(
                                        "transition",
                                        mode === "desktop-collapsed" && "opacity-0 scale-0 w-0"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {isMobile && open && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
            )}
        </>
    );
}
