import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { type ListConfirmPreviewData } from "@repo/shared";
import { Public } from "src/auth/decorators/public.decorator";
import { ListConfirmService } from "src/contacts/list-confirm.service";
import { ListConfirmAcceptDto } from "src/contacts/dto/list-confirm.dto";

@Controller("list-confirm")
export class ListConfirmController {
  constructor(private readonly listConfirmService: ListConfirmService) {}

  @Public()
  @Get("preview")
  preview(@Query("token") token: string): Promise<ListConfirmPreviewData> {
    return this.listConfirmService.preview(token);
  }

  @Public()
  @Post("accept")
  accept(@Body() dto: ListConfirmAcceptDto): Promise<{ success: true }> {
    return this.listConfirmService.accept(dto.token);
  }
}
