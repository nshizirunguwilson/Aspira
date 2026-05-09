"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/feedback",
    label: "Feedback",
    icon: FileText,
    match: (p) => p.startsWith("/admin/feedback"),
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart2,
    match: (p) => p.startsWith("/admin/analytics"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    match: (p) => p.startsWith("/admin/settings"),
  },
];

function SidebarBody({
  pathname,
  onNavigate,
  onLogout,
  userName,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  userName: string | undefined;
}) {
  return (
    <>
      <div className="px-6 py-6 border-b border-border-subtle">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-2xl text-primary-950 leading-none"
        >
          Aspira
        </Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-text-tertiary">
          Admin panel
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-colors duration-fast",
                active
                  ? "text-primary-900 font-medium"
                  : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="admin-active-nav"
                  className="absolute inset-0 -z-10 rounded-md bg-primary-50"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-2 py-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 text-text-inverse text-xs font-semibold">
            {(userName ?? "·").charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{userName}</p>
            <p className="text-xs text-text-tertiary truncate">Administrator</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full mt-2 flex items-center gap-2 px-3 h-9 rounded-md text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors duration-fast"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  async function handleLogout() {
    await logout();
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <>
      <aside
        className="hidden md:flex flex-col bg-bg-elevated border-r border-border-subtle"
        style={{ width: "var(--sidebar-width)" }}
      >
        <SidebarBody
          pathname={pathname}
          onLogout={handleLogout}
          userName={user?.name}
        />
      </aside>

      <header className="md:hidden sticky top-0 z-40 h-[64px] bg-bg-elevated border-b border-border-subtle px-5 flex items-center justify-between">
        <Link href="/admin" className="font-display text-2xl text-primary-950 leading-none">
          Aspira
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-bg-subtle"
        >
          <Menu size={20} />
        </button>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-bg-inverse/50 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 h-full w-[80vw] max-w-sm bg-bg-elevated shadow-xl flex flex-col">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close admin menu"
              className="self-end m-3 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg-subtle"
            >
              <X size={18} />
            </button>
            <SidebarBody
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              onLogout={handleLogout}
              userName={user?.name}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
