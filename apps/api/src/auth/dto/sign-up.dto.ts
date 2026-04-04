import { createZodDto } from "nestjs-zod";
import { signUpSchema } from "@repo/shared";

export class SignUpDto extends createZodDto(signUpSchema) {}
