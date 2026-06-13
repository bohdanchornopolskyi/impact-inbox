import { createZodDto } from "nestjs-zod";
import { updateTemplateSchema } from "@repo/shared";

export class UpdateTemplateDto extends createZodDto(updateTemplateSchema) {}
