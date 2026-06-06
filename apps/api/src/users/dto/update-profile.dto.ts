import { createZodDto } from "nestjs-zod";
import { updateProfileSchema } from "@repo/shared";

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
