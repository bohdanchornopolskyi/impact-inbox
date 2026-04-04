import { createZodDto } from "nestjs-zod";
import { createSessionSchema } from "@repo/shared";

export class CreateSessionDto extends createZodDto(createSessionSchema) {}
