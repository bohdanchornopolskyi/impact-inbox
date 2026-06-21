import { createZodDto } from "nestjs-zod";
import { restoreTemplateRevisionSchema } from "@repo/shared";

export class RestoreTemplateRevisionDto extends createZodDto(
  restoreTemplateRevisionSchema,
) {}
