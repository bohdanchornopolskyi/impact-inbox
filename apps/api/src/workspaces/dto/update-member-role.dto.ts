import { createZodDto } from "nestjs-zod";
import { updateMemberRoleSchema } from "@repo/shared";

export class UpdateMemberRoleDto extends createZodDto(updateMemberRoleSchema) {}
