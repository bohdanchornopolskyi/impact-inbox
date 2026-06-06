import { createZodDto } from "nestjs-zod";
import { confirmEmailSchema } from "@repo/shared";

export class ConfirmEmailDto extends createZodDto(confirmEmailSchema) {}
