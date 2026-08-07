"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Briefcase,
  ClipboardList,
  ShieldCheck,
    Users,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const STUDENT_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: UserCircle },
  { href: "/drives", label: "Placement Drives", icon: Briefcase },
  { href: "/applications", label: "My Applications", icon: ClipboardList },
];

const ADMIN_LINKS = [
  { href: "/admin/drives", label: "Manage Drives", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: ShieldCheck },
    { href: "/admin/batches", label: "Batch Management", icon: Users },
];

function NavLinks({ pathname, onNavigate }) {
  const { user } = useAuth();
  const links = user?.role === "ADMIN" ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-[var(--primary)]"
                : "text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--foreground)] dark:hover:bg-white/5"
            )}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-500/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <Icon className="relative h-4.5 w-4.5" />
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] py-6 lg:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-lexend)" }}>
            PlacementHub
          </span>
        </Link>
        <NavLinks pathname={pathname} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--surface)] py-6 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between px-5">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-lexend)" }}>
                    PlacementHub
                  </span>
                </Link>
                <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
