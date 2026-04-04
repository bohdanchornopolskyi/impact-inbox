import { createZodDto } from "nestjs-zod";
import { getUserByEmailSchema } from "@repo/shared";

export class getUserByEmailDto extends createZodDto(getUserByEmailSchema) {}
