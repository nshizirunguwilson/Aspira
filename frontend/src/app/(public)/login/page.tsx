"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthSplit } from "@/components/layout/AuthSplit";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldError, Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { auth, apiErrorMessage } from "@/lib/api";
import { phoneSchema } from "@/lib/validations";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  phone_number: phoneSchema,
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof schema>;

function safeRedirect(target: string | null, fallback: string): string {
  // Only allow same-origin relative paths to prevent open-redirect.
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  return target;
}

function LoginInner() {
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
    defaultValues: { phone_number: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setTopError(null);
    try {
      const { data } = await auth.loginCitizen(values);
      setUser({ type: "citizen", id: data.citizen.id, name: data.citizen.name });
      toast.success(`Welcome back, ${data.citizen.name}.`);
      const target = safeRedirect(search?.get("redirect") ?? null, "/dashboard");
      router.push(target);
      router.refresh();
    } catch (error) {
      setTopError(apiErrorMessage(error, "Login failed"));
    }
  }

  return (
    <AuthSplit>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-tertiary mb-3">
            Sign in
          </p>
          <h1 className="font-display text-3xl text-primary-950">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Track your submitted feedback and follow each issue to resolution.
          </p>
        </div>

        {topError ? (
          <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
            {topError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="phone_number">Phone number</Label>
            <Input
              id="phone_number"
              type="tel"
              autoComplete="tel"
              placeholder="+250 7XX XXX XXX"
              leadingIcon={<User size={16} />}
              invalid={Boolean(errors.phone_number)}
              {...register("phone_number")}
            />
            <FieldError message={errors.phone_number?.message} />
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
                  className="text-text-tertiary hover:text-text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <p className="text-xs text-text-tertiary">
            <Link href="/forgot-password" className="hover:underline">
              Forgot your password?
            </Link>
          </p>

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

        <p className="text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-text-accent font-medium hover:underline"
          >
            Create one →
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
