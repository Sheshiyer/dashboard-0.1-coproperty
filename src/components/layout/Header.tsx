"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* User Avatar Placeholder */}
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">US</span>
                </div>
            </div>
        </header>
    );
}
