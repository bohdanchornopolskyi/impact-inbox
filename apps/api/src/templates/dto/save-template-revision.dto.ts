import { createZodDto } from "nestjs-zod";
import { saveTemplateRevisionSchema } from "@repo/shared";

export class SaveTemplateRevisionDto extends createZodDto(
  saveTemplateRevisionSchema,
) {}
