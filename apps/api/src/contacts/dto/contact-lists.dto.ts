import { createZodDto } from "nestjs-zod";
import {
  createContactListSchema,
  updateContactListSchema,
} from "@repo/shared";

export class CreateContactListDto extends createZodDto(createContactListSchema) {}
export class UpdateContactListDto extends createZodDto(updateContactListSchema) {}
