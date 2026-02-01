"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDashboardRefresh } from "@/components/dashboard/dashboard-auto-refresh";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { Search, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format a Date into a human-readable relative timestamp.
 *
 * Returns strings like "Just now", "2 min ago", "1 hr ago".
 */
function formatLastUpdated(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 30) return "Just now";
    if (diffMin < 1) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ============================================================================
// Header Component
// ============================================================================

export function Header() {
    const pathname = usePathname();
    const openCommandPalette = useCommandPaletteStore((s) => s.open);

    // Dashboard refresh context - returns null if outside provider
    const refreshContext = useDashboardRefresh();

    const lastUpdated = refreshContext?.lastUpdated;
    const isRefreshing = refreshContext?.isRefreshing ?? false;
    const refresh = refreshContext?.refresh;

    // Simple breadcrumb generation
    const segments = pathname?.split("/").filter(Boolean) || [];
    const breadcrumbs = segments.map((segment) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: `/${segment}`,
    }));

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background px-6 shadow-sm mb-4">
            {/* Mobile Menu Trigger - replaced with MobileNav */}
            <MobileNav />

            {/* Breadcrumbs */}
            <div className="hidden flex-col md:flex">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={cn("font-medium", segments.length === 0 && "text-foreground")}>Dashboard</span>
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center gap-2">
                            <span>/</span>
                            <span className={cn("font-medium", index === breadcrumbs.length - 1 && "text-foreground")}>
                                {crumb.label}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4">
                {/* Last Updated Timestamp */}
                {lastUpdated && (
                    <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Updated {formatLastUpdated(lastUpdated)}</span>
                    </div>
                )}

                {/* Manual Refresh Button */}
                {refresh && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refresh()}
                        disabled={isRefreshing}
                        aria-label="Refresh dashboard data"
                        title="Refresh dashboard data"
                    >
                        <RefreshCw
                            className={cn(
                                "h-4.5 w-4.5 transition-transform",
                                isRefreshing && "animate-spin"
                            )}
                        />
                    </Button>
                )}

                {/* Command Palette Trigger (search bar) */}
                <button
                    onClick={openCommandPalette}
                    aria-label="Open search (Command K)"
                    className={cn(
                        "relative hidden w-full max-w-sm md:flex items-center",
                        "rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer",
                    )}
                >
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">Search properties, reservations...</span>
                    <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border border-muted-foreground/20 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                        {"\u2318"}K
                    </kbd>
                </button>

                {/* Notifications - full dropdown with badge */}
                <NotificationsDropdown />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Avatar Placeholder */}
                <div
                    role="img"
                    aria-label="User avatar"
                    className="h-8 w-8 rounded-full bg-primary/20 border border-primary/10 flex items-center justify-center"
                >
                    <span className="text-xs font-semibold text-primary" aria-hidden="true">US</span>
                </div>
            </div>
        </header>
    );
}
