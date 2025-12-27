import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/global";
import {
    ArrowDownToLine,
    BoxIcon,
    ChevronDown,
    Gauge,
    Factory,
    History,
    LayoutDashboard,
    Package,
    Users,
    Warehouse,
    Weight,
    Layers,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export const menuConfig = [
    {
        type: "item",
        label: "Início",
        to: "/",
        icon: LayoutDashboard,
    },
    {
        type: "group",
        label: "Cadastros",
        items: [
            { label: "Clientes", to: "/customers", icon: Users },
            { label: "Fornecedores", to: "/suppliers", icon: Users },
            {
                label: "Definições de Produto",
                to: "/product-definitions",
                icon: BoxIcon,
            },
        ],
    },
    {
        type: "group",
        label: "Estoque",
        items: [
            { label: "Matérias primas", to: "/raw-material", icon: Layers },
            { label: "Produtos", to: "/products", icon: Package },
            {
                label: "Entrada de mercadoria",
                to: "/inventory/inbound",
                icon: ArrowDownToLine,
            },
            {
                label: "Movimentação de estoque",
                to: "/inventory/movements",
                icon: History,
            },
            { label: "Ordens de produção", to: "/production-orders", icon: Factory },
            { label: "Unidades de medida", to: "/unities", icon: Weight },
            { label: "Depósitos", to: "/warehouses", icon: Warehouse },
        ],
    },
];

function isRouteActive(pathname: string, basePath: string) {
    if (pathname === basePath) return true;
    return pathname.startsWith(`${basePath}/`);
}

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

    const initialOpen = menuConfig.filter((m) => m.type === "group").map((g) => g.label);
    const [openGroups, setOpenGroups] = useState<string[]>(initialOpen);

    const toggleGroup = (label: string) => {
        setOpenGroups((prev) =>
            prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
        );
    };

    const baseClasses = cn(
        "sticky top-0 flex flex-col h-screen shrink-0 overflow-y-auto border-r bg-sidebar/95 text-sidebar-foreground backdrop-blur transition-all duration-300",
        width
    );

    const mobileClasses = cn(
        "fixed inset-y-0 left-0 w-64 border-r bg-sidebar/95 text-sidebar-foreground shadow-xl backdrop-blur z-50 transform transition-transform",
        open ? "translate-x-0" : "-translate-x-64"
    );

    const isMobile = mode === "mobile-overlay";

    return (
        <>
            <TooltipProvider delayDuration={200}>
                <aside className={isMobile ? mobileClasses : baseClasses}>
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
                                    <p className="text-[11px] tracking-wide text-muted-foreground">
                                        {user?.enterpriseName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <nav className="flex-1 px-3 py-2 space-y-2">
                        {menuConfig.map((entry) => {
                            if (entry.type === "item") {
                                const active = isRouteActive(location.pathname, entry.to);
                                const Icon = entry.icon;

                                const content = (
                                    <Link
                                        to={entry.to}
                                        onClick={isMobile ? onClose : undefined}
                                        className={cn(
                                            "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer",
                                            collapsed ? "justify-center gap-0 px-2" : "gap-3",
                                            active
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-zinc-200 hover:text-foreground"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "flex size-9 items-center justify-center rounded-lg border bg-card/70 transition",
                                                active && "border-primary/30 bg-primary/25"
                                            )}
                                        >
                                            <Icon className="size-4" />
                                        </span>

                                        {!collapsed && (
                                            <span className="truncate">{entry.label}</span>
                                        )}
                                    </Link>
                                );

                                return collapsed ? (
                                    <Tooltip key={entry.to}>
                                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                                        <TooltipContent side="right">{entry.label}</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <div key={entry.to}>{content}</div>
                                );
                            }

                            if (entry.type === "group") {
                                const isOpen = openGroups.includes(entry.label);

                                return (
                                    <div key={entry.label}>
                                        {!collapsed && (
                                            <button
                                                onClick={() => toggleGroup(entry.label)}
                                                className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground transition cursor-pointer"
                                            >
                                                {entry.label}
                                                <ChevronDown
                                                    className={cn(
                                                        "size-4 transition-transform",
                                                        isOpen ? "rotate-180" : "rotate-0"
                                                    )}
                                                />
                                            </button>
                                        )}

                                        <div
                                            className={cn(
                                                "mt-1 overflow-hidden transition-all duration-300",
                                                collapsed || isOpen ? "max-h-96" : "max-h-0"
                                            )}
                                        >
                                            {entry.items.map((item) => {
                                                const active = isRouteActive(
                                                    location.pathname,
                                                    item.to
                                                );
                                                const Icon = item.icon;

                                                const content = (
                                                    <Link
                                                        to={item.to}
                                                        onClick={isMobile ? onClose : undefined}
                                                        className={cn(
                                                            "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer",
                                                            collapsed
                                                                ? "justify-center gap-0 px-2"
                                                                : "gap-3",
                                                            active
                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                : "hover:bg-zinc-200 hover:text-foreground"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "flex size-9 items-center justify-center rounded-lg border bg-card/70 transition",
                                                                active &&
                                                                    "border-primary/30 bg-primary/25"
                                                            )}
                                                        >
                                                            <Icon className="size-4" />
                                                        </span>

                                                        {!collapsed && (
                                                            <span className="truncate">
                                                                {item.label}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );

                                                return collapsed ? (
                                                    <Tooltip key={item.to}>
                                                        <TooltipTrigger asChild>
                                                            {content}
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right">
                                                            {item.label}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <div key={item.to}>{content}</div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </nav>
                </aside>
            </TooltipProvider>

            {isMobile && open && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
            )}
        </>
    );
}
