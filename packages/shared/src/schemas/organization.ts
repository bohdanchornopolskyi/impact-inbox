import { z } from "zod";
import { PLAN_TIERS } from "../constants/billing";
import { ORGANIZATION_ROLES } from "../constants/organization";

export const organizationRoleSchema = z.enum(ORGANIZATION_ROLES);

export const planTierSchema = z.enum(PLAN_TIERS);

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  planTier: planTierSchema.nullable(),
  trialEndsAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const organizationListItemSchema = organizationSchema.extend({
  role: organizationRoleSchema,
});

export const organizationDetailSchema = organizationSchema.extend({
  role: organizationRoleSchema,
});

export type OrganizationRole = z.infer<typeof organizationRoleSchema>;
export type PlanTier = z.infer<typeof planTierSchema>;
export type OrganizationData = z.infer<typeof organizationSchema>;
export type OrganizationListItemData = z.infer<typeof organizationListItemSchema>;
export type OrganizationDetailData = z.infer<typeof organizationDetailSchema>;

export type AuthenticatedOrganizationContext = {
  organization: OrganizationData;
  role: OrganizationRole;
};
