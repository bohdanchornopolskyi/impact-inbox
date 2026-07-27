import { createZodDto } from "nestjs-zod";
import { updateOrganizationAssetSchema } from "@repo/shared";

export class UpdateOrganizationAssetDto extends createZodDto(
  updateOrganizationAssetSchema,
) {}
