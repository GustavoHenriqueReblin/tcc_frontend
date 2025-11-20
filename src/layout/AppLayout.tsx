import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/useIsMobile";

export function AppLayout() {
    const isMobile = useIsMobile();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopExpanded, setDesktopExpanded] = useState(true);

    const sidebarMode = isMobile
        ? "mobile-overlay"
        : desktopExpanded
          ? "desktop-expanded"
          : "desktop-collapsed";

    const open = isMobile ? mobileOpen : desktopExpanded;

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            <Sidebar mode={sidebarMode} open={open} onClose={() => setMobileOpen(false)} />

            <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
                <Header
                    onToggleMobile={() => setMobileOpen(!mobileOpen)}
                    desktopExpanded={desktopExpanded}
                    onToggleDesktop={() => setDesktopExpanded(!desktopExpanded)}
                />

                <main className="p-6 flex-1 overflow-x-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
