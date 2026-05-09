"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthSplit } from "@/components/layout/AuthSplit";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldError, Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { auth, apiErrorMessage } from "@/lib/api";
import {
  idNumberSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/validations";

const schema = z
  .object({
    full_name: z.string().trim().min(3, "Enter your full name"),
    phone_number: phoneSchema,
    id_number: idNumberSchema,
    address: z.string().trim().min(1, "Choose your district / address"),
    password: passwordSchema,
    confirm_password: z.string().min(6),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterValues = z.infer<typeof schema>;

function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      id_number: "",
      address: "",
      password: "",
      confirm_password: "",
    },
  });

  const passwordValue = watch("password");
  const score = passwordStrength(passwordValue);

  async function onSubmit(values: RegisterValues) {
    setTopError(null);
    try {
      await auth.registerCitizen(values);
      toast.success("Account created. Sign in to continue.");
      router.push("/login");
    } catch (error) {
      setTopError(apiErrorMessage(error, "Could not create account"));
    }
  }

  return (
    <AuthSplit
      testimonial="“Aspira gives me a real channel to ask for things to be fixed — and to see them actually move.”"
      attribution="— J. Mukamana, Kicukiro District"
    >
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-tertiary mb-3">
            Register
          </p>
          <h1 className="font-display text-3xl text-primary-950">
            Create your account.
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Submit and track public service feedback.
          </p>
        </div>

        {topError ? (
          <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
            {topError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              autoComplete="name"
              placeholder="Jean-Pierre Habimana"
              invalid={Boolean(errors.full_name)}
              {...register("full_name")}
            />
            <FieldError message={errors.full_name?.message} />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone number</Label>
            <Input
              id="phone_number"
              type="tel"
              autoComplete="tel"
              placeholder="+250 7XX XXX XXX"
              invalid={Boolean(errors.phone_number)}
              {...register("phone_number")}
            />
            <FieldError message={errors.phone_number?.message} />
          </div>

          <div>
            <Label htmlFor="id_number">National ID number</Label>
            <Input
              id="id_number"
              placeholder="1 1990 8 XXXXXXX XX"
              invalid={Boolean(errors.id_number)}
              {...register("id_number")}
            />
            <FieldError message={errors.id_number?.message} />
          </div>

          <div>
            <Label htmlFor="address">District / address</Label>
            <Input
              id="address"
              placeholder="Gasabo, Kicukiro, Nyarugenge…"
              invalid={Boolean(errors.address)}
              {...register("address")}
            />
            <FieldError message={errors.address?.message} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
            <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={
                    "h-1 rounded-full transition-colors duration-fast " +
                    (i < score
                      ? score === 1
                        ? "bg-status-cancelled"
                        : score === 2
                          ? "bg-status-pending"
                          : "bg-status-solved"
                      : "bg-border-subtle")
                  }
                />
              ))}
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div>
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              invalid={Boolean(errors.confirm_password)}
              {...register("confirm_password")}
            />
            <FieldError message={errors.confirm_password?.message} />
          </div>

          <p className="text-xs text-text-tertiary">
            Your information is used only to verify your identity and contact you
            about your feedback.
          </p>

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size={16} className="text-text-inverse" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-text-accent font-medium hover:underline"
          >
            Log in →
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
