import { createZodDto } from "nestjs-zod";
import { updateWorkspaceModuleSchema } from "@repo/shared";

export class UpdateWorkspaceModuleDto extends createZodDto(
  updateWorkspaceModuleSchema,
) {}
