import { createZodDto } from "nestjs-zod";
import { listTemplatesQuerySchema } from "@repo/shared";

export class ListTemplatesQueryDto extends createZodDto(
  listTemplatesQuerySchema,
) {}
