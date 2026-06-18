"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import type { SignInInput } from "@repo/shared";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { inputProps, submitButtonClassName } from "@/components/ui/form-styles";
import { useSignIn } from "@/lib/auth-hooks";

export function SignInForm() {
  const signInMutation = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Enter your account details."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit((values) => signInMutation.mutate(values))}
        noValidate
      >
        <FormField
          id="email"
          label="Email"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            {...inputProps(Boolean(errors.email))}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            {...inputProps(Boolean(errors.password))}
          />
        </FormField>

        <FormError error={signInMutation.error} />

        <button
          type="submit"
          disabled={isSubmitting || signInMutation.isPending}
          className={submitButtonClassName(
            isSubmitting || signInMutation.isPending,
          )}
        >
          {signInMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
