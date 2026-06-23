"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/client";
import { acceptListConfirm, previewListConfirm } from "@/lib/api/contacts-api";

function ConfirmSubscriptionContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof previewListConfirm>
  > | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing confirmation token");
      return;
    }
    previewListConfirm(token)
      .then(setPreview)
      .catch(() => setError("Invalid or expired confirmation link"));
  }, [token]);

  if (error) {
    return <p className="text-ui-sm text-status-error-fg">{error}</p>;
  }

  if (!preview) {
    return <p className="text-ui-sm text-text-secondary">Loading…</p>;
  }

  if (preview.expired || preview.alreadyUsed) {
    return (
      <p className="text-ui-sm text-text-secondary">
        {preview.alreadyUsed
          ? "This confirmation link was already used."
          : "This confirmation link has expired."}
      </p>
    );
  }

  if (accepted) {
    return (
      <p className="text-ui-sm text-text-primary">
        You are subscribed to {preview.listName}. You can close this page.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-ui-sm text-text-secondary">
        Confirm subscription to <strong>{preview.listName}</strong> from{" "}
        {preview.workspaceName} for {preview.emailMasked}.
      </p>
      <Button
        variant="primary"
        onClick={() => {
          if (!token) return;
          acceptListConfirm(token)
            .then(() => setAccepted(true))
            .catch(() => setError("Could not confirm subscription"));
        }}
      >
        Confirm subscription
      </Button>
    </div>
  );
}

export function ConfirmSubscriptionView() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border border-border-default bg-surface-card p-8 shadow-sm">
        <h1 className="text-ui-2xl font-semibold text-text-primary">
          Confirm subscription
        </h1>
        <div className="mt-4">
          <Suspense fallback={<p className="text-ui-sm text-text-secondary">Loading…</p>}>
            <ConfirmSubscriptionContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
