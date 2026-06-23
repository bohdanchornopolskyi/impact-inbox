"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type FeatureLockProps = {
  locked: boolean;
  orgId: string;
  children: ReactNode;
};

export function FeatureLock({ locked, orgId, children }: FeatureLockProps) {
  if (!locked) {
    return children;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border-default bg-surface-card p-6 text-center shadow-lg">
          <p className="text-ui-sm font-medium text-text-primary">
            Contacts are locked
          </p>
          <p className="mt-2 text-ui-sm text-text-secondary">
            Subscribe to import contacts and manage lists. Templates remain
            available in template access mode.
          </p>
          <Link
            href={`/org/${orgId}/settings`}
            className="mt-4 inline-flex text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            View organization settings
          </Link>
        </div>
      </div>
    </div>
  );
}
