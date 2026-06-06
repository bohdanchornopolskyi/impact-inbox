import { createZodDto } from "nestjs-zod";
import { deleteAccountSchema } from "@repo/shared";

export class DeleteAccountDto extends createZodDto(deleteAccountSchema) {}
