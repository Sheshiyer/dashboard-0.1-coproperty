"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Calendar,
  AlertTriangle,
  Sparkles,
  Package,
  Info,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotificationsStore,
  type NotificationType,
} from "@/stores/notifications-store";
import { formatDistanceToNow } from "date-fns";

// ============================================================================
// Icon Map
// ============================================================================

const notificationIcons: Record<NotificationType, LucideIcon> = {
  "check-in": Calendar,
  "overdue-task": AlertTriangle,
  cleaning: Sparkles,
  inventory: Package,
  system: Info,
};

const notificationColors: Record<NotificationType, string> = {
  "check-in": "text-blue-500 bg-blue-500/10",
  "overdue-task": "text-red-500 bg-red-500/10",
  cleaning: "text-amber-500 bg-amber-500/10",
  inventory: "text-orange-500 bg-orange-500/10",
  system: "text-muted-foreground bg-muted",
};

// ============================================================================
// Notifications Dropdown Component
// ============================================================================

export function NotificationsDropdown() {
  const { notifications, markAsRead, markAllAsRead, removeNotification } =
    useNotificationsStore();
  const unreadCount = useNotificationsStore((s) => s.unreadCount());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">
            Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="glass"
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];
              const timeAgo = formatDistanceToNow(
                new Date(notification.timestamp),
                { addSuffix: true },
              );

              const content = (
                <div
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      colorClass,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-tight",
                          !notification.read
                            ? "font-semibold"
                            : "font-medium text-muted-foreground",
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {timeAgo}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        className="rounded p-1 hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      className="rounded p-1 hover:bg-muted"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      title="Dismiss"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );

              if (notification.href) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    className="block"
                    onClick={() => markAsRead(notification.id)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={notification.id}>{content}</div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <Link
                href="/settings"
                className="flex w-full items-center justify-center rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                Notification Settings
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
