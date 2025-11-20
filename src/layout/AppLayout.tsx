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

            <main className="flex-1 flex flex-col transition-all duration-300">
                <Header
                    onToggleMobile={() => setMobileOpen(!mobileOpen)}
                    desktopExpanded={desktopExpanded}
                    onToggleDesktop={() => setDesktopExpanded(!desktopExpanded)}
                />

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
