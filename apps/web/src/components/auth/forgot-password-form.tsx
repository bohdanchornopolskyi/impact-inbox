"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import type { ForgotPasswordInput } from "@repo/shared";
import {
  AuthNotice,
  AuthNoticeEmail,
  AuthShell,
  Button,
  Input,
  MailCheckIcon,
  AuthBackLink,
} from "@repo/ui/client";
import { ApiFormError } from "@/components/ui/api-form-error";
import { useForgotPassword } from "@/lib/auth-hooks";

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (forgotPasswordMutation.isSuccess) {
    const email = getValues("email");

    return (
      <AuthShell logoHref="/">
        <AuthNotice icon={<MailCheckIcon />} title="Check your inbox">
          <>
            If an account exists for{" "}
            <AuthNoticeEmail email={email} />, we sent a password reset link.
          </>
        </AuthNotice>
        <AuthBackLink href="/sign-in" className="mt-[22px]" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your account email and we'll send a reset link."
      logoHref="/"
    >
      <form
        onSubmit={handleSubmit((values) => forgotPasswordMutation.mutate(values))}
        noValidate
      >
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <ApiFormError error={forgotPasswordMutation.error} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-1"
          disabled={isSubmitting || forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <AuthBackLink href="/sign-in" className="mt-4" />
    </AuthShell>
  );
}
