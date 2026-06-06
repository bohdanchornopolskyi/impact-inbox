import { createZodDto } from "nestjs-zod";
import { resetPasswordSchema } from "@repo/shared";

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
