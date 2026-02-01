"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Menu,
  LayoutDashboard,
  Building,
  Calendar,
  Sparkles,
  ClipboardList,
  Package,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPaletteStore } from "@/stores/command-palette-store";

// ============================================================================
// Navigation Items (mirrors Sidebar)
// ============================================================================

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Properties", href: "/properties", icon: Building },
  { title: "Reservations", href: "/reservations", icon: Calendar },
  { title: "Cleaning", href: "/cleaning", icon: Sparkles },
  { title: "Tasks", href: "/tasks", icon: ClipboardList },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Settings", href: "/settings", icon: Settings },
];

// ============================================================================
// Mobile Navigation Drawer Component
// ============================================================================

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const openCommandPalette = useCommandPaletteStore((s) => s.open);

  // Close on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Menu Trigger Button - only visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Drawer Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="flex flex-col p-0 w-72">
          {/* Header */}
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="text-lg font-bold tracking-tight text-primary">
              Co.Property
            </SheetTitle>
            <SheetDescription className="text-xs">
              Operations Dashboard
            </SheetDescription>
          </SheetHeader>

          {/* Search Shortcut */}
          <div className="px-4 pt-4">
            <button
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => openCommandPalette(), 200);
              }}
              aria-label="Open search (Command K)"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground",
                "hover:bg-muted/50 transition-colors",
              )}
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-auto rounded border border-muted-foreground/20 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium">
                {"\u2318"}K
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4">
            <div className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", isActive && "text-primary")}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center justify-between">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">US</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">User</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
