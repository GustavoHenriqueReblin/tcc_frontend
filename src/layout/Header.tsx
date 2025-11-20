import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";

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

    return (
        <header className="px-4 h-14 flex items-center justify-between border-b bg-background">
            {isMobile ? (
                <Button variant="ghost" size="icon" onClick={onToggleMobile}>
                    <Menu className="size-5" />
                </Button>
            ) : (
                <Button variant="ghost" size="icon" onClick={onToggleDesktop}>
                    {desktopExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
                </Button>
            )}

            <span className="font-medium text-sm md:text-base">
                Bem-vindo{user?.username ? `, ${user.username}` : ""}!
            </span>

            <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => logout()}
            >
                <LogOut className="size-5" />
                Sair
            </Button>
        </header>
    );
}
