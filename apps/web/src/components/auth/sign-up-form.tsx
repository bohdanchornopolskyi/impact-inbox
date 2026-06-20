"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import type { SignUpInput } from "@repo/shared";
import {
  AuthShell,
  Button,
  Input,
  PasswordInput,
  authShellLinkClass,
} from "@repo/ui/client";
import { ApiFormError } from "@/components/ui/api-form-error";
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
      title="Create your account"
      description="Start a free 7-day trial — no card required."
      logoHref="/"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className={authShellLinkClass()}>
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => signUpMutation.mutate(values))}
        noValidate
      >
        <Input
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Maya Chen"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <ApiFormError error={signUpMutation.error} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-1"
          disabled={isSubmitting || signUpMutation.isPending}
        >
          {signUpMutation.isPending ? "Creating account..." : "Create account"}
        </Button>

        <p className="mt-4 text-center text-ui-xs leading-normal text-text-muted">
          By creating an account you agree to the Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
