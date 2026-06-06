import { createZodDto } from "nestjs-zod";
import { inviteMemberSchema } from "@repo/shared";

export class InviteMemberDto extends createZodDto(inviteMemberSchema) {}
