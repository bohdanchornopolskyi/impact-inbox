"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import type { ResetPasswordInput } from "@repo/shared";
import {
  AuthBackLink,
  AuthShell,
  Button,
  PasswordInput,
} from "@repo/ui/client";
import { ApiFormError } from "@/components/ui/api-form-error";
import { useResetPassword } from "@/lib/auth-hooks";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const resetPasswordMutation = useResetPassword();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (token) {
      setValue("token", token);
    }
  }, [token, setValue]);

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        description="Request a new password reset link and try again."
        logoHref="/"
      >
        <AuthBackLink href="/forgot-password">Request new link</AuthBackLink>
      </AuthShell>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <AuthShell
        title="Password updated"
        description="Your password has been reset. You can sign in with your new password."
        logoHref="/"
      >
        <AuthBackLink href="/sign-in">Continue to sign in</AuthBackLink>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Enter a new password for your account."
      logoHref="/"
    >
      <form
        onSubmit={handleSubmit((values) => resetPasswordMutation.mutate(values))}
        noValidate
      >
        <input type="hidden" {...register("token")} />

        <PasswordInput
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          placeholder="Create a password"
          hint="At least 8 characters."
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordInput
          id="confirmNewPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword")}
        />

        <ApiFormError error={resetPasswordMutation.error} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-1"
          disabled={isSubmitting || resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Updating..." : "Update password"}
        </Button>
      </form>
      <AuthBackLink href="/sign-in" className="mt-4" />
    </AuthShell>
  );
}
