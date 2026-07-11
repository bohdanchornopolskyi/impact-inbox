import { createZodDto } from "nestjs-zod";
import { inviteAcceptSchema } from "@repo/shared";

export class InviteAcceptDto extends createZodDto(inviteAcceptSchema) {}
