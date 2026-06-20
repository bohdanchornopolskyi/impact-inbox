"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import type { SignInInput } from "@repo/shared";
import {
  AuthShell,
  Button,
  Input,
  PasswordInput,
  authShellLinkClass,
} from "@repo/ui/client";
import { ApiFormError } from "@/components/ui/api-form-error";
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
      title="Welcome back"
      description="Sign in to your workspace."
      logoHref="/"
      footer={
        <>
          New to Impact Inbox?{" "}
          <Link href="/sign-up" className={authShellLinkClass()}>
            Create an account
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => signInMutation.mutate(values))}
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

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <ApiFormError error={signInMutation.error} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-1"
          disabled={isSubmitting || signInMutation.isPending}
        >
          {signInMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
