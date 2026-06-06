import { createZodDto } from "nestjs-zod";
import { changePasswordSchema } from "@repo/shared";

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
