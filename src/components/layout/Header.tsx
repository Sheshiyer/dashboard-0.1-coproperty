"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDashboardRefresh } from "@/components/dashboard/dashboard-auto-refresh";
import { Search, Bell, Menu, RefreshCw, Clock } from "lucide-react";
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
            {/* Mobile Menu Trigger */}
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
            </Button>

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

                {/* Search Placeholder */}
                <div className="relative hidden w-full max-w-sm md:flex items-center">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search properties, reservations..."
                        className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Avatar Placeholder */}
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">US</span>
                </div>
            </div>
        </header>
    );
}
