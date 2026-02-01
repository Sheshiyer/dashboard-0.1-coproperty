"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Search,
  LayoutDashboard,
  Building,
  Calendar,
  Sparkles,
  ClipboardList,
  Package,
  Settings,
  Clock,
  Plus,
  ArrowRight,
  FileText,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useHotkeys } from "@/hooks/use-hotkeys";

// ============================================================================
// Types
// ============================================================================

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  category: "page" | "action" | "recent";
  keywords?: string[];
}

// ============================================================================
// Constants
// ============================================================================

const RECENT_PAGES_KEY = "command-palette-recent";
const MAX_RECENT = 5;

const PAGES: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview and analytics",
    icon: LayoutDashboard,
    href: "/",
    category: "page",
    keywords: ["home", "overview", "analytics"],
  },
  {
    id: "properties",
    label: "Properties",
    description: "Manage your properties",
    icon: Building,
    href: "/properties",
    category: "page",
    keywords: ["listing", "rental", "house", "apartment"],
  },
  {
    id: "reservations",
    label: "Reservations",
    description: "View bookings and check-ins",
    icon: Calendar,
    href: "/reservations",
    category: "page",
    keywords: ["booking", "guest", "check-in", "check-out"],
  },
  {
    id: "cleaning",
    label: "Cleaning",
    description: "Cleaning schedules and status",
    icon: Sparkles,
    href: "/cleaning",
    category: "page",
    keywords: ["clean", "housekeeping", "turnover"],
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Task management and assignments",
    icon: ClipboardList,
    href: "/tasks",
    category: "page",
    keywords: ["todo", "maintenance", "repair", "assign"],
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Track supplies and equipment",
    icon: Package,
    href: "/inventory",
    category: "page",
    keywords: ["supplies", "stock", "equipment", "items"],
  },
  {
    id: "settings",
    label: "Settings",
    description: "App configuration and preferences",
    icon: Settings,
    href: "/settings",
    category: "page",
    keywords: ["config", "preferences", "account", "profile"],
  },
];

const QUICK_ACTIONS: CommandItem[] = [
  {
    id: "create-task",
    label: "Create Task",
    description: "Add a new maintenance task",
    icon: Plus,
    href: "/tasks",
    category: "action",
    keywords: ["new", "add", "task", "maintenance"],
  },
  {
    id: "new-reservation",
    label: "New Reservation",
    description: "Create a manual reservation",
    icon: FileText,
    href: "/reservations",
    category: "action",
    keywords: ["book", "reserve", "guest"],
  },
];

// ============================================================================
// Recent Pages Helper
// ============================================================================

function getRecentPages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_PAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentPage(pageId: string) {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentPages().filter((id) => id !== pageId);
    recent.unshift(pageId);
    localStorage.setItem(
      RECENT_PAGES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT)),
    );
  } catch {
    // Silently fail on storage errors
  }
}

// ============================================================================
// Fuzzy Search
// ============================================================================

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;

  // Simple fuzzy: all query chars appear in order in target
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function searchItems(query: string, items: CommandItem[]): CommandItem[] {
  if (!query.trim()) return items;
  return items.filter(
    (item) =>
      fuzzyMatch(query, item.label) ||
      (item.description && fuzzyMatch(query, item.description)) ||
      item.keywords?.some((kw) => fuzzyMatch(query, kw)),
  );
}

// ============================================================================
// Command Palette Component
// ============================================================================

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandPaletteStore();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Register Cmd+K / Ctrl+K
  useHotkeys("mod+k", () => toggle());

  // Build the item list
  const recentIds = getRecentPages();
  const recentIdKey = recentIds.join(",");
  const recentItems: CommandItem[] = recentIds
    .map((id) => {
      const page = PAGES.find((p) => p.id === id);
      if (!page) return null;
      return { ...page, category: "recent" as const };
    })
    .filter(Boolean) as CommandItem[];

  const allItems = React.useMemo(() => {
    if (query.trim()) {
      return searchItems(query, [...PAGES, ...QUICK_ACTIONS]);
    }
    // No query: show recent, then pages, then actions
    const sections: CommandItem[] = [];
    if (recentItems.length > 0) sections.push(...recentItems);
    sections.push(...PAGES);
    sections.push(...QUICK_ACTIONS);
    return sections;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, recentIdKey]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  React.useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-command-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  function executeItem(item: CommandItem) {
    if (item.href) {
      addRecentPage(item.id);
      router.push(item.href);
    }
    if (item.action) {
      item.action();
    }
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (allItems[selectedIndex]) {
          executeItem(allItems[selectedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
    }
  }

  // Group items by category for display
  function getCategoryLabel(category: string): string {
    switch (category) {
      case "recent":
        return "Recent";
      case "page":
        return "Pages";
      case "action":
        return "Quick Actions";
      default:
        return "";
    }
  }

  // Build grouped display
  const grouped: { category: string; items: { item: CommandItem; globalIndex: number }[] }[] = [];
  let globalIdx = 0;
  let lastCategory = "";
  for (const item of allItems) {
    if (item.category !== lastCategory) {
      grouped.push({ category: item.category, items: [] });
      lastCategory = item.category;
    }
    grouped[grouped.length - 1].items.push({ item, globalIndex: globalIdx });
    globalIdx++;
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%]",
            "rounded-xl border shadow-2xl",
            "backdrop-blur-2xl bg-white/90 dark:bg-gray-900/95",
            "border-white/30 dark:border-white/15",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]",
            "overflow-hidden",
          )}
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">
            Command Palette
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search for pages, properties, reservations, and quick actions.
          </DialogPrimitive.Description>

          {/* Search Input */}
          <div className="flex items-center border-b border-white/20 dark:border-white/10 px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex h-12 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-muted-foreground/20 bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2"
          >
            {allItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.category} className="mb-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {getCategoryLabel(group.category)}
                  </div>
                  {group.items.map(({ item, globalIndex }) => {
                    const Icon = item.icon;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={`${item.category}-${item.id}`}
                        data-command-item
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50",
                        )}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {item.category === "recent" ? (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          ) : item.category === "action" ? (
                            <div className="flex h-4 w-4 items-center justify-center">
                              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          ) : (
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{item.label}</span>
                            {item.description && (
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/20 dark:border-white/10 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-muted-foreground/20 bg-muted/50 px-1 py-0.5 text-[10px]">
                &uarr;&darr;
              </kbd>
              <span>Navigate</span>
              <kbd className="rounded border border-muted-foreground/20 bg-muted/50 px-1 py-0.5 text-[10px]">
                &crarr;
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-muted-foreground/20 bg-muted/50 px-1 py-0.5 text-[10px]">
                &lceil;K
              </kbd>
              <span>to toggle</span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
