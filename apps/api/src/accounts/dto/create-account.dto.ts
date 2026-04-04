import { createZodDto } from "nestjs-zod";
import { createAccountSchema } from "@repo/shared";

export class CreateAccountDto extends createZodDto(createAccountSchema) {}
