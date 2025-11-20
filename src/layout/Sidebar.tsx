import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Gauge, LayoutDashboard, Package, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const menuItems = [
    { label: "Inicio", to: "/", icon: LayoutDashboard },
    { label: "Produtos", to: "/products", icon: Package },
    { label: "Clientes", to: "/customers", icon: Users },
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
    const { user } = useAuth();
    const collapsed = mode === "desktop-collapsed";
    const width = collapsed ? "w-20" : "w-64";

    const baseClasses = cn(
        "sticky top-0 flex h-screen flex-col overflow-y-auto border-r bg-sidebar/95 text-sidebar-foreground backdrop-blur transition-all duration-300",
        width
    );

    const mobileOverlayClasses = cn(
        "fixed inset-y-0 left-0 w-64 border-r bg-sidebar/95 text-sidebar-foreground shadow-xl backdrop-blur z-50 transform transition-transform",
        open ? "translate-x-0" : "-translate-x-64"
    );

    const isMobile = mode === "mobile-overlay";

    return (
        <>
            <aside className={isMobile ? mobileOverlayClasses : baseClasses}>
                <div className={cn("px-4 pb-2 pt-5", collapsed && "px-2")}>
                    <div
                        className={cn(
                            "flex items-center gap-3 rounded-xl border bg-sidebar-accent/40 px-3 py-3",
                            collapsed && "justify-center"
                        )}
                    >
                        <span className="flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground shadow">
                            <Gauge className="size-5" />
                        </span>

                        {!collapsed && (
                            <div className="space-y-0.5">
                                <p className="text-sm font-semibold leading-tight">
                                    ERP Industrial
                                </p>
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    {user?.enterpriseName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-2">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.to;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={isMobile ? onClose : undefined}
                                className={cn(
                                    "group relative flex items-center overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition",
                                    collapsed ? "justify-center gap-0 px-2" : "gap-3",
                                    active
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-sidebar-accent/60 hover:text-foreground"
                                )}
                                aria-current={active ? "page" : undefined}
                            >
                                <span
                                    className={cn(
                                        "absolute left-0 top-0 h-full w-1 bg-primary/70 transition",
                                        active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                                    )}
                                />

                                <span
                                    className={cn(
                                        "flex size-9 items-center justify-center rounded-lg border bg-card/70 text-foreground transition",
                                        active &&
                                            "border-primary/30 bg-primary/25 text-primary-foreground"
                                    )}
                                >
                                    <Icon className="size-4" />
                                </span>

                                <span className={cn("truncate transition", collapsed && "sr-only")}>
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
