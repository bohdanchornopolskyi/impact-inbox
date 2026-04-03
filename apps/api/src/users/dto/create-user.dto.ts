import { createZodDto } from "nestjs-zod";
import { createUserSchema } from "@repo/shared";

export class CreateUserDto extends createZodDto(createUserSchema) {}
