import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNavigate } from "react-router-dom";

export function Header({
    desktopExpanded,
    onToggleMobile,
    onToggleDesktop,
}: {
    desktopExpanded: boolean;
    onToggleMobile: () => void;
    onToggleDesktop: () => void;
}) {
    const { user, logout } = useAuth();
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const fallback = (user?.username?.slice(0, 1) || "U").toUpperCase();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-backdrop-filter:backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4">
                {isMobile ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleMobile}
                        className="rounded-full"
                    >
                        <Menu className="size-5" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleDesktop}
                        className="rounded-full"
                    >
                        {desktopExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
                    </Button>
                )}

                {/* <div className="hidden flex-1 items-center md:flex">
                    <label className="relative flex w-full max-w-xl items-center">
                        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar ordens, clientes ou ações rápidas"
                            className="w-full rounded-full border bg-muted/60 pl-9 pr-3 text-sm focus-visible:ring-2"
                        />
                    </label>
                </div> */}

                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon-sm" className="rounded-full">
                        <Bell className="size-4" />
                    </Button>

                    <div className="flex items-center gap-3 rounded-full border bg-card/70 px-3 py-1.5">
                        <Avatar className="size-8 border">
                            <AvatarFallback className="text-xs font-semibold uppercase">
                                {fallback}
                            </AvatarFallback>
                        </Avatar>

                        <div className="hidden leading-tight md:flex md:flex-col">
                            <span className="text-sm font-semibold">
                                {user?.username || "Usuario"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Acesso interno
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full"
                            onClick={handleLogout}
                            aria-label="Sair"
                        >
                            <LogOut className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
