import { createZodDto } from "nestjs-zod";
import { createTemplateSchema } from "@repo/shared";

export class CreateTemplateDto extends createZodDto(createTemplateSchema) {}
