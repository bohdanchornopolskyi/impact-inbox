import { createZodDto } from "nestjs-zod";
import {
  addListMemberSchema,
  updateListMemberStatusSchema,
  executeImportSchema,
} from "@repo/shared";

export class AddListMemberDto extends createZodDto(addListMemberSchema) {}
export class UpdateListMemberStatusDto extends createZodDto(
  updateListMemberStatusSchema,
) {}
export class ExecuteImportDto extends createZodDto(executeImportSchema) {}
