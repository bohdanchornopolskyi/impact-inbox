import { createZodDto } from "nestjs-zod";
import { forgotPasswordSchema } from "@repo/shared";

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
