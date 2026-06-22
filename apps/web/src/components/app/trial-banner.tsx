"use client";

import Link from "next/link";
import type { OrganizationListItemData } from "@repo/shared";
import { format } from "date-fns";
import { getTrialStatus } from "@/lib/org/trial-status";

type TrialBannerProps = {
  organization: OrganizationListItemData;
};

export function TrialBanner({ organization }: TrialBannerProps) {
  const trial = getTrialStatus(organization);

  if (!trial) {
    return null;
  }

  const dayLabel = trial.daysRemaining === 1 ? "day" : "days";

  return (
    <section className="rounded-2xl border border-border-default bg-surface-inset px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-ui-xs font-medium tracking-wide text-text-tertiary uppercase">
            Trial
          </p>
          <p className="mt-1 text-ui-sm text-text-primary">
            {trial.daysRemaining > 0
              ? `${trial.daysRemaining} ${dayLabel} left in your full-access trial.`
              : "Your trial ends today."}
          </p>
          <p className="mt-1 text-ui-xs text-text-secondary">
            Trial ends {format(trial.endsAt, "PPp")}. No card required.
          </p>
        </div>
        <Link
          href={`/org/${organization.id}/settings`}
          className="text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
        >
          Organization settings
        </Link>
      </div>
    </section>
  );
}
