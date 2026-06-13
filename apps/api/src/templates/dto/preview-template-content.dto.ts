import { createZodDto } from "nestjs-zod";
import { previewTemplateContentSchema } from "@repo/shared";

export class PreviewTemplateContentDto extends createZodDto(
  previewTemplateContentSchema,
) {}
