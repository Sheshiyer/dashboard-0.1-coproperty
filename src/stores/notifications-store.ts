import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType =
  | "check-in"
  | "overdue-task"
  | "cleaning"
  | "inventory"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

interface NotificationsState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

function generateMockNotifications(): Notification[] {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 86400000)
    .toISOString()
    .split("T")[0];

  return [
    {
      id: "n1",
      type: "check-in",
      title: "Check-in Today",
      description: "Guest arriving at Oceanview Villa - 3:00 PM",
      timestamp: `${today}T15:00:00`,
      read: false,
      href: "/reservations",
    },
    {
      id: "n2",
      type: "check-in",
      title: "Check-in Tomorrow",
      description: "2 guests arriving at Mountain Lodge",
      timestamp: `${tomorrow}T14:00:00`,
      read: false,
      href: "/reservations",
    },
    {
      id: "n3",
      type: "overdue-task",
      title: "Overdue Task",
      description: "Replace smoke detector batteries - Sunset Apartment",
      timestamp: new Date(now.getTime() - 172800000).toISOString(),
      read: false,
      href: "/tasks",
    },
    {
      id: "n4",
      type: "cleaning",
      title: "Cleaning Verification Needed",
      description: "Post-checkout cleaning at Beachfront Suite needs review",
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      read: false,
      href: "/cleaning",
    },
    {
      id: "n5",
      type: "inventory",
      title: "Low Inventory Alert",
      description: "Towel sets running low at Downtown Loft (3 remaining)",
      timestamp: new Date(now.getTime() - 7200000).toISOString(),
      read: true,
      href: "/inventory",
    },
    {
      id: "n6",
      type: "system",
      title: "System Update",
      description: "Dashboard v0.1 features deployed successfully",
      timestamp: new Date(now.getTime() - 86400000).toISOString(),
      read: true,
    },
  ];
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: generateMockNotifications(),

      setNotifications: (notifications) => set({ notifications }),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: "notifications-storage",
    },
  ),
);
