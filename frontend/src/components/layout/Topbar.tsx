"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";

function Wordmark() {
  return (
    <Link href="/" className="font-display text-2xl text-primary-950 leading-none">
      Aspira
    </Link>
  );
}

function AvatarInitial({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "·";
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 text-text-inverse text-xs font-semibold"
    >
      {initial}
    </span>
  );
}

export function Topbar() {
  const { user, status, logout } = useAuthStore();
  const router = useRouter();

  const isCitizen = user?.type === "citizen";
  const isAdmin = user?.type === "admin";

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 h-[64px] border-b border-border-subtle bg-bg-base/90 backdrop-blur-md"
      style={{ height: "var(--nav-height)" }}
    >
      <div className="max-w-content mx-auto flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/" className="hover:text-text-primary transition-colors">
              All Feedback
            </Link>
            {isCitizen ? (
              <Link
                href="/dashboard"
                className="hover:text-text-primary transition-colors"
              >
                Dashboard
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                className="hover:text-text-primary transition-colors"
              >
                Admin Panel
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {status === "loading" ? null : user ? (
            <>
              <AvatarInitial name={user.name} />
              <span className="hidden sm:block text-sm text-text-primary">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
