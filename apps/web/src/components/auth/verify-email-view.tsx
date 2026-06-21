"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthBackLink,
  AuthNotice,
  AuthNoticeEmail,
  AuthShell,
  AuthShellDivider,
  Button,
  MailCheckIcon,
  authShellLinkClass,
} from "@repo/ui/client";
import { ApiFormError } from "@/components/ui/api-form-error";
import { resolveDefaultAppPath } from "@/lib/app-navigation";
import {
  useConfirmEmail,
  useResendVerification,
} from "@/lib/auth-hooks";
import { listWorkspaces } from "@/lib/api/workspaces-api";
import { getMe } from "@/lib/api/users-api";
import { getAuthToken } from "@/lib/auth-token";

type VerifyEmailViewProps = {
  initialEmail?: string;
};

export function VerifyEmailView({ initialEmail }: VerifyEmailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email") ?? initialEmail ?? "";
  const confirmEmailMutation = useConfirmEmail();
  const resendMutation = useResendVerification();
  const [resolvedEmail, setResolvedEmail] = useState(emailParam);
  const [confirmAttempted, setConfirmAttempted] = useState(false);

  useEffect(() => {
    if (!emailParam) {
      const sessionToken = getAuthToken();
      if (!sessionToken) {
        return;
      }

      getMe(sessionToken)
        .then((user) => setResolvedEmail(user.email))
        .catch(() => undefined);
    }
  }, [emailParam]);

  useEffect(() => {
    if (!tokenParam || confirmAttempted) {
      return;
    }

    setConfirmAttempted(true);
    confirmEmailMutation.mutate({ token: tokenParam });
  }, [tokenParam, confirmAttempted, confirmEmailMutation.mutate]);

  const displayEmail = resolvedEmail || "you@company.com";
  const mailtoHref = useMemo(
    () => `mailto:${encodeURIComponent(displayEmail)}`,
    [displayEmail],
  );

  if (tokenParam && confirmEmailMutation.isPending) {
    return (
      <AuthShell logoHref="/">
        <p className="text-center text-ui-md text-text-secondary">
          Verifying your email...
        </p>
      </AuthShell>
    );
  }

  if (tokenParam && confirmEmailMutation.isSuccess) {
    return (
      <AuthShell logoHref="/">
        <AuthNotice icon={<MailCheckIcon />} title="Email verified">
          Your account is active. You can sign in and start your trial.
        </AuthNotice>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-[22px]"
          onClick={async () => {
            const sessionToken = getAuthToken();
            if (!sessionToken) {
              router.push("/sign-in");
              return;
            }

            const workspaces = await listWorkspaces(sessionToken);
            const destination = resolveDefaultAppPath(workspaces) ?? "/sign-in";
            router.push(destination);
            router.refresh();
          }}
        >
          Continue
        </Button>
      </AuthShell>
    );
  }

  if (tokenParam && confirmEmailMutation.isError) {
    return (
      <AuthShell logoHref="/">
        <AuthNotice icon={<MailCheckIcon />} title="Verification link expired">
          Request a new verification email and try again.
        </AuthNotice>
        <ApiFormError error={confirmEmailMutation.error} />
        <ResendAction
          email={displayEmail}
          resendMutation={resendMutation}
          className="mt-4"
        />
        <AuthShellDivider />
        <AuthBackLink href="/sign-in" className="mt-[18px]" />
      </AuthShell>
    );
  }

  return (
    <AuthShell logoHref="/">
      <AuthNotice icon={<MailCheckIcon />} title="Check your inbox">
        <>
          We sent a verification link to{" "}
          <AuthNoticeEmail email={displayEmail} />. Click it to activate your
          account and start your trial.
        </>
      </AuthNotice>
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        className="mt-[22px]"
        onClick={() => {
          window.location.href = mailtoHref;
        }}
      >
        Open email app
      </Button>
      <ResendAction
        email={displayEmail}
        resendMutation={resendMutation}
        className="mt-4"
      />
      <ApiFormError error={resendMutation.error} />
      {resendMutation.isSuccess ? (
        <p className="mt-2 text-center text-ui-sm text-status-success-fg">
          Verification email sent.
        </p>
      ) : null}
      <AuthShellDivider />
      <AuthBackLink href="/sign-in" className="mt-[18px]" />
    </AuthShell>
  );
}

function ResendAction({
  resendMutation,
  className,
}: {
  email: string;
  resendMutation: ReturnType<typeof useResendVerification>;
  className?: string;
}) {
  const sessionToken = getAuthToken();

  if (!sessionToken) {
    return (
      <p className={`text-center text-ui-base text-text-tertiary ${className ?? ""}`}>
        Sign in to resend the verification email.
      </p>
    );
  }

  return (
    <p className={`text-center text-ui-base text-text-tertiary ${className ?? ""}`}>
      Didn&apos;t get it?{" "}
      <button
        type="button"
        className={authShellLinkClass()}
        disabled={resendMutation.isPending}
        onClick={() => resendMutation.mutate()}
      >
        {resendMutation.isPending ? "Sending..." : "Resend email"}
      </button>
    </p>
  );
}
