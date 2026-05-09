"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldError, Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { auth, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof schema>;

function safeRedirect(target: string | null, fallback: string): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  return target;
}

function AdminLoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setTopError(null);
    try {
      const { data } = await auth.loginAdmin(values);
      setUser({
        type: "admin",
        id: data.admin.id,
        name: data.admin.username,
      });
      toast.success(`Signed in as ${data.admin.username}.`);
      const target = safeRedirect(search?.get("redirect") ?? null, "/admin");
      router.push(target);
      router.refresh();
    } catch (error) {
      setTopError(apiErrorMessage(error, "Login failed"));
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-inverse text-text-inverse px-6">
      <div className="w-full max-w-md bg-bg-elevated text-text-primary rounded-2xl shadow-xl p-10 space-y-7">
        <div className="flex items-center gap-3 text-text-secondary">
          <ShieldCheck size={18} />
          <span className="text-xs uppercase tracking-widest">Admin sign-in</span>
        </div>

        <div>
          <h1 className="font-display text-3xl text-primary-950">
            Aspira Admin
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in with your administrator credentials.
          </p>
        </div>

        {topError ? (
          <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
            {topError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              leadingIcon={<User size={16} />}
              invalid={Boolean(errors.username)}
              {...register("username")}
            />
            <FieldError message={errors.username?.message} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              leadingIcon={<Lock size={16} />}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size={16} className="text-text-inverse" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="text-xs text-text-tertiary text-center">
          Citizen account?{" "}
          <Link href="/login" className="text-text-accent hover:underline">
            Sign in here →
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}
