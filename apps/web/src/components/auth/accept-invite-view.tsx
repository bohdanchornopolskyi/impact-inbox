"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inviteAcceptSignInFormSchema,
  inviteAcceptSignUpFormSchema,
  type InviteAcceptSignInFormInput,
  type InviteAcceptSignUpFormInput,
  type InvitePreviewData,
} from "@repo/shared";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  PasswordInput,
  authShellLinkClass,
} from "@repo/ui/client";
import { ApiFormError } from "@/components/ui/api-form-error";
import { acceptInvite, previewInvite } from "@/lib/api/invites-api";
import { signIn } from "@/lib/api/auth-api";
import { getMe } from "@/lib/api/users-api";
import {
  getAuthToken,
  navigateAfterAuth,
  setAuthToken,
} from "@/lib/auth-session";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [preview, setPreview] = useState<InvitePreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<Error | null>(null);

  const signUpForm = useForm<InviteAcceptSignUpFormInput>({
    resolver: zodResolver(inviteAcceptSignUpFormSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signInForm = useForm<InviteAcceptSignInFormInput>({
    resolver: zodResolver(inviteAcceptSignInFormSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Missing invite token");
      return;
    }

    previewInvite(token)
      .then(setPreview)
      .catch(() => setError("Invalid or expired invite link"));

    const existingToken = getAuthToken();
    if (!existingToken) {
      setSessionToken(null);
      setSessionEmail(null);
      return;
    }

    getMe(existingToken)
      .then((user) => {
        setSessionToken(existingToken);
        setSessionEmail(user.email);
      })
      .catch(() => {
        setSessionToken(null);
        setSessionEmail(null);
      });
  }, [token]);

  async function handleAcceptAsCurrentUser() {
    if (!token || !sessionToken) {
      return;
    }

    setAccepting(true);
    setAcceptError(null);

    try {
      await acceptInvite({ token }, sessionToken);
      await navigateAfterAuth(router, sessionToken);
    } catch (acceptFailure) {
      setAcceptError(
        acceptFailure instanceof Error
          ? acceptFailure
          : new Error("Could not accept invite"),
      );
    } finally {
      setAccepting(false);
    }
  }

  if (error) {
    return <p className="text-ui-sm text-status-error-fg">{error}</p>;
  }

  if (!preview) {
    return <p className="text-ui-sm text-text-secondary">Loading…</p>;
  }

  if (preview.accepted) {
    return (
      <p className="text-ui-sm text-text-secondary">
        This invite has already been accepted.
      </p>
    );
  }

  if (preview.revoked) {
    return (
      <p className="text-ui-sm text-text-secondary">
        This invite has been revoked.
      </p>
    );
  }

  if (preview.expired) {
    return (
      <p className="text-ui-sm text-text-secondary">
        This invite has expired. Ask an admin to resend it.
      </p>
    );
  }

  const inviteSummary = (
    <p className="text-ui-sm text-text-secondary">
      You&apos;re invited to join <strong>{preview.organizationName}</strong>
      {preview.workspaceName ? (
        <>
          {" "}
          / <strong>{preview.workspaceName}</strong>
        </>
      ) : null}{" "}
      as {preview.workspaceRole ?? preview.organizationRole}.
    </p>
  );

  if (sessionEmail) {
    if (sessionEmail.toLowerCase() !== preview.email.toLowerCase()) {
      return (
        <div className="space-y-4">
          {inviteSummary}
          <p className="text-ui-sm text-status-error-fg">
            This invite was sent to {preview.email}, but you are signed in as{" "}
            {sessionEmail}. Sign out and try again with the invited account.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {inviteSummary}
        <p className="text-ui-sm text-text-secondary">
          Signed in as {sessionEmail}. Accept to join.
        </p>
        <ApiFormError error={acceptError} />
        <Button
          variant="primary"
          disabled={accepting}
          onClick={() => {
            void handleAcceptAsCurrentUser();
          }}
        >
          Accept invite
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {inviteSummary}
      <p className="text-ui-sm text-text-secondary">
        Invited email: <strong>{preview.email}</strong>
      </p>

      <div className="flex gap-3 text-ui-sm">
        <button
          type="button"
          className={
            mode === "signup"
              ? "font-medium text-text-primary"
              : "text-text-secondary"
          }
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
        <span className="text-text-tertiary">·</span>
        <button
          type="button"
          className={
            mode === "signin"
              ? "font-medium text-text-primary"
              : "text-text-secondary"
          }
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
      </div>

      {mode === "signup" ? (
        <form
          className="space-y-4"
          onSubmit={signUpForm.handleSubmit(async (values) => {
            if (!token) {
              return;
            }

            setAcceptError(null);

            try {
              const result = await acceptInvite({
                token,
                name: values.name,
                password: values.password,
                confirmPassword: values.confirmPassword,
              });

              if (!result.token) {
                throw new Error("Invite accept did not return a session");
              }

              setAuthToken(result.token);
              await navigateAfterAuth(router, result.token);
            } catch (acceptFailure) {
              setAcceptError(
                acceptFailure instanceof Error
                  ? acceptFailure
                  : new Error("Could not accept invite"),
              );
            }
          })}
          noValidate
        >
          <Input
            id="invite-email"
            label="Email"
            type="email"
            value={preview.email}
            disabled
          />
          <Input
            id="invite-name"
            label="Full name"
            type="text"
            autoComplete="name"
            error={signUpForm.formState.errors.name?.message}
            {...signUpForm.register("name")}
          />
          <PasswordInput
            id="invite-password"
            label="Password"
            autoComplete="new-password"
            error={signUpForm.formState.errors.password?.message}
            {...signUpForm.register("password")}
          />
          <PasswordInput
            id="invite-confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            error={signUpForm.formState.errors.confirmPassword?.message}
            {...signUpForm.register("confirmPassword")}
          />
          <ApiFormError error={acceptError} />
          <Button
            type="submit"
            variant="primary"
            disabled={signUpForm.formState.isSubmitting}
          >
            Create account and accept
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={signInForm.handleSubmit(async (values) => {
            if (!token) {
              return;
            }

            setAcceptError(null);

            try {
              const { token: authToken } = await signIn({
                email: preview.email,
                password: values.password,
              });
              setAuthToken(authToken);
              await acceptInvite({ token }, authToken);
              await navigateAfterAuth(router, authToken);
            } catch (acceptFailure) {
              setAcceptError(
                acceptFailure instanceof Error
                  ? acceptFailure
                  : new Error("Could not accept invite"),
              );
            }
          })}
          noValidate
        >
          <Input
            id="invite-signin-email"
            label="Email"
            type="email"
            value={preview.email}
            disabled
          />
          <PasswordInput
            id="invite-signin-password"
            label="Password"
            autoComplete="current-password"
            error={signInForm.formState.errors.password?.message}
            {...signInForm.register("password")}
          />
          <ApiFormError error={acceptError} />
          <Button
            type="submit"
            variant="primary"
            disabled={signInForm.formState.isSubmitting}
          >
            Sign in and accept
          </Button>
        </form>
      )}

      <p className="text-ui-xs text-text-tertiary">
        Prefer the full auth pages?{" "}
        <Link
          href={`/sign-in?next=${encodeURIComponent(`/accept-invite?token=${token ?? ""}`)}`}
          className={authShellLinkClass()}
        >
          Sign in
        </Link>{" "}
        or{" "}
        <Link
          href={`/sign-up?next=${encodeURIComponent(`/accept-invite?token=${token ?? ""}`)}`}
          className={authShellLinkClass()}
        >
          sign up
        </Link>
        .
      </p>
    </div>
  );
}

export function AcceptInviteView() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border border-border-default bg-surface-card p-8 shadow-sm">
        <h1 className="text-ui-2xl font-semibold text-text-primary">
          Accept invite
        </h1>
        <div className="mt-4">
          <Suspense
            fallback={<p className="text-ui-sm text-text-secondary">Loading…</p>}
          >
            <AcceptInviteContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
