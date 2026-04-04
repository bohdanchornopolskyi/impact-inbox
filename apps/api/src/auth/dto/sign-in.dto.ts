import { createZodDto } from "nestjs-zod";
import { signInSchema } from "@repo/shared";

export class SignInDto extends createZodDto(signInSchema) {}
