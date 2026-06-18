"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import type { SignUpInput } from "@repo/shared";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { inputProps, submitButtonClassName } from "@/components/ui/form-styles";
import { useSignUp } from "@/lib/auth-hooks";

export function SignUpForm() {
  const signUpMutation = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <AuthShell
      title="Create account"
      description="Start building email templates with your workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit((values) => signUpMutation.mutate(values))}
        noValidate
      >
        <FormField id="name" label="Name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            {...inputProps(Boolean(errors.name))}
          />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
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
          hint="8-24 characters with upper, lower, number, and special character."
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            {...inputProps(Boolean(errors.password))}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            {...inputProps(Boolean(errors.confirmPassword))}
          />
        </FormField>

        <FormError error={signUpMutation.error} />

        <button
          type="submit"
          disabled={isSubmitting || signUpMutation.isPending}
          className={submitButtonClassName(
            isSubmitting || signUpMutation.isPending,
          )}
        >
          {signUpMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
