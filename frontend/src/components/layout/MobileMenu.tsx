"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogOut, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isCitizen = user?.type === "citizen";
  const isAdmin = user?.type === "admin";

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-bg-inverse/50 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 h-full w-[80vw] max-w-sm bg-bg-elevated shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <span className="font-display text-xl text-primary-950">Aspira</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg-subtle"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
          <Link
            href="/"
            onClick={onClose}
            className="px-3 py-3 rounded-md text-text-primary hover:bg-bg-subtle"
          >
            All feedback
          </Link>
          {isCitizen ? (
            <>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="px-3 py-3 rounded-md text-text-primary hover:bg-bg-subtle"
              >
                Dashboard
              </Link>
              <Link
                href="/submit"
                onClick={onClose}
                className="px-3 py-3 rounded-md text-text-primary hover:bg-bg-subtle"
              >
                Submit feedback
              </Link>
            </>
          ) : null}
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={onClose}
              className="px-3 py-3 rounded-md text-text-primary hover:bg-bg-subtle"
            >
              Admin panel
            </Link>
          ) : null}
        </nav>
        <div className="px-5 py-4 border-t border-border-subtle">
          {user ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={async () => {
                await logout();
                onClose();
              }}
            >
              <LogOut size={14} />
              Sign out · {user.name}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={onClose}>
                <Button variant="secondary" fullWidth>
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={onClose}>
                <Button fullWidth>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
