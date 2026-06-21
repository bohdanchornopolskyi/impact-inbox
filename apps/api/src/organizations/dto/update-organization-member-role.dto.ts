import { createZodDto } from "nestjs-zod";
import { updateOrganizationMemberRoleSchema } from "@repo/shared";

export class UpdateOrganizationMemberRoleDto extends createZodDto(
  updateOrganizationMemberRoleSchema,
) {}
