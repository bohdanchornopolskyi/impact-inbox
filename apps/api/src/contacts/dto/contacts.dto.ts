import { createZodDto } from "nestjs-zod";
import {
  createContactSchema,
  updateContactSchema,
  listContactsQuerySchema,
} from "@repo/shared";

export class CreateContactDto extends createZodDto(createContactSchema) {}
export class UpdateContactDto extends createZodDto(updateContactSchema) {}
export class ListContactsQueryDto extends createZodDto(listContactsQuerySchema) {}
