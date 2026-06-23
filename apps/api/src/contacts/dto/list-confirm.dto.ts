import { createZodDto } from "nestjs-zod";
import { listConfirmAcceptSchema } from "@repo/shared";

export class ListConfirmAcceptDto extends createZodDto(listConfirmAcceptSchema) {}
