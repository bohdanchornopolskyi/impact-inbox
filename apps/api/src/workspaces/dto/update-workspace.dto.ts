import { createZodDto } from "nestjs-zod";
import { updateWorkspaceSchema } from "@repo/shared";

export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
