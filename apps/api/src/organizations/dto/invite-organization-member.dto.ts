import { createZodDto } from "nestjs-zod";
import { inviteOrganizationMemberSchema } from "@repo/shared";

export class InviteOrganizationMemberDto extends createZodDto(
  inviteOrganizationMemberSchema,
) {}
