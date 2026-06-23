import type { OrganizationListItemData } from "@repo/shared";
import { isAfter } from "date-fns";
import { parseApiDate } from "@/lib/format-date";

export function isTemplateAccessMode(
  organization: Pick<OrganizationListItemData, "trialEndsAt" | "planTier">,
): boolean {
  if (organization.planTier) {
    return false;
  }

  const trialEndsAt = parseApiDate(organization.trialEndsAt);
  if (!trialEndsAt) {
    return true;
  }

  return !isAfter(trialEndsAt, new Date());
}
