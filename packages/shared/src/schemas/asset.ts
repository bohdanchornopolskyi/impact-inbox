import { z } from "zod";

export const organizationAssetSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(255),
  url: z.string().url(),
  contentType: z.string().min(1),
  byteSize: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const updateOrganizationAssetSchema = z.object({
  name: z.string().min(1).max(255),
});

export const organizationAssetUsageSchema = z.object({
  inUse: z.boolean(),
  templateNames: z.array(z.string()),
  revisionCount: z.number().int().nonnegative(),
  moduleNames: z.array(z.string()),
  brandKitWorkspaces: z.array(z.string()),
});

export type OrganizationAssetData = z.infer<typeof organizationAssetSchema>;
export type UpdateOrganizationAssetInput = z.infer<
  typeof updateOrganizationAssetSchema
>;
export type OrganizationAssetUsageData = z.infer<
  typeof organizationAssetUsageSchema
>;

export const uploadedAssetSchema = organizationAssetSchema;
export type UploadedAssetData = OrganizationAssetData;
