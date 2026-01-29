"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Building,
    Calendar,
    Sparkles,
    ClipboardList,
    Package,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { isOpen, toggle } = useSidebarStore();

    const navItems = [
        {
            title: "Dashboard",
            href: "/",
            icon: LayoutDashboard,
        },
        {
            title: "Properties",
            href: "/properties",
            icon: Building,
        },
        {
            title: "Reservations",
            href: "/reservations",
            icon: Calendar,
        },
        {
            title: "Cleaning",
            href: "/cleaning",
            icon: Sparkles,
        },
        {
            title: "Tasks",
            href: "/tasks",
            icon: ClipboardList,
        },
        {
            title: "Inventory",
            href: "/inventory",
            icon: Package,
        },
        {
            title: "Settings",
            href: "/settings",
            icon: Settings,
        },
    ];

    return (
        <aside
            className={cn(
                "relative hidden h-screen border-r bg-card transition-[width] duration-300 ease-in-out md:flex",
                isOpen ? "w-72" : "w-20",
                className
            )}
        >
            <div className="flex h-full w-full flex-col">
                {/* Header */}
                <div className={cn("flex h-16 items-center border-b px-4", isOpen ? "justify-between" : "justify-center")}>
                    {isOpen && (
                        <span className="text-lg font-bold tracking-tight text-primary">
                            Co.Property
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggle}
                        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="grid gap-1 px-2">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                                        isActive
                                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                                            : "text-muted-foreground hover:bg-muted",
                                        !isOpen && "justify-center px-2"
                                    )}
                                    title={!isOpen ? item.title : undefined}
                                >
                                    <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                                    {isOpen && <span>{item.title}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer (User Profile or similar) */}
                <div className="border-t p-4">
                    {isOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">User</span>
                                <span className="text-xs text-muted-foreground">Admin</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-muted" />
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
