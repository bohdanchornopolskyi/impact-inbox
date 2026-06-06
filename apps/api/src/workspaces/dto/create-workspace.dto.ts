import { createZodDto } from "nestjs-zod";
import { createWorkspaceSchema } from "@repo/shared";

export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
