"use client";

import Link from "next/link";
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  Settings,
  UserCircle,
  Bell,
  Trash2,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import Avatar from "@/components/ui/Avatar";
import { getInitials } from "@/lib/utils";

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { profile } = useProfile();

  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotifications(user?.userId);

  return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] glass px-4 lg:px-8">

        <div className="flex items-center gap-3">
          <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {title && (
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h1>
          )}
        </div>

        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
              onClick={toggle}
              className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-white/5"
          >
            {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5" />
            ) : (
                <Moon className="h-4.5 w-4.5" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                  className="relative rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-white/5"
                  aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="w-80 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg"
              >

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">
                    Notifications
                  </h2>

                  {unreadCount > 0 && (
                      <span className="text-xs text-[var(--muted)]">
                    {unreadCount} unread
                  </span>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">

                  {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                        No notifications
                      </div>
                  ) : (
                      notifications.map((notification) => (
                          <div
                              key={notification.id}
                              className={`border-b border-[var(--border)] px-4 py-3 ${
                                  !notification.isRead
                                      ? "bg-slate-50 dark:bg-white/5"
                                      : ""
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">

                              <button
                                  onClick={() => {
                                    if (!notification.isRead) {
                                      markAsRead(notification.id);
                                    }
                                  }}
                                  className="flex-1 text-left"
                              >
                                <div className="flex items-center gap-2">
                                  {!notification.isRead && (
                                      <span className="h-2 w-2 rounded-full bg-red-500" />
                                  )}

                                  <p className="text-sm font-medium text-[var(--foreground)]">
                                    {notification.title}
                                  </p>
                                </div>

                                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                  {notification.message}
                                </p>

                                <p className="mt-1 text-[10px] text-[var(--muted)]">
                                  {new Date(
                                      notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </button>

                              {/* Delete */}
                              <button
                                  onClick={() =>
                                      deleteNotification(notification.id)
                                  }
                                  className="rounded-md p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                  aria-label="Delete notification"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>
                          </div>
                      ))
                  )}

                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Profile */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5">
                <Avatar
                    src={profile?.profileImageUrl}
                    initials={getInitials(user?.firstName, user?.lastName)}
                    size="sm"
                />

                <span className="hidden text-sm font-medium text-[var(--foreground)] sm:block">
                {user?.firstName || "Account"}
              </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg"
              >

                <DropdownMenu.Item asChild>
                  <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <UserCircle className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none hover:bg-slate-50 dark:hover:bg-white/5">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />

                <DropdownMenu.Item
                    onClick={logout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--danger)] outline-none hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenu.Item>

              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

        </div>
      </header>
  );
}