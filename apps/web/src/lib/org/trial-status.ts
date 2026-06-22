import { differenceInCalendarDays, isAfter } from "date-fns";
import type { OrganizationListItemData } from "@repo/shared";
import { parseApiDate } from "@/lib/format-date";

export type TrialStatus = {
  isActive: boolean;
  endsAt: Date;
  daysRemaining: number;
};

export function getTrialStatus(
  organization: Pick<OrganizationListItemData, "trialEndsAt" | "planTier">,
): TrialStatus | null {
  if (organization.planTier) {
    return null;
  }

  const endsAt = parseApiDate(organization.trialEndsAt);

  if (!endsAt || !isAfter(endsAt, new Date())) {
    return null;
  }

  return {
    isActive: true,
    endsAt,
    daysRemaining: differenceInCalendarDays(endsAt, new Date()),
  };
}
