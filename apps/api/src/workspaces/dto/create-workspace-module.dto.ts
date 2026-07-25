import { createZodDto } from "nestjs-zod";
import { createWorkspaceModuleSchema } from "@repo/shared";

export class CreateWorkspaceModuleDto extends createZodDto(
  createWorkspaceModuleSchema,
) {}
