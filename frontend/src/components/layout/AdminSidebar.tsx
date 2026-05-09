"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
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

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <aside
      className="hidden md:flex flex-col bg-bg-elevated border-r border-border-subtle"
      style={{ width: "var(--sidebar-width)" }}
    >
      <div className="px-6 py-6 border-b border-border-subtle">
        <Link href="/admin" className="font-display text-2xl text-primary-950 leading-none">
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
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-colors duration-fast",
                active
                  ? "bg-primary-50 text-primary-900 font-medium"
                  : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-2 py-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 text-text-inverse text-xs font-semibold">
            {(user?.name ?? "·").charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-tertiary truncate">Administrator</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-2 px-3 h-9 rounded-md text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors duration-fast"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
