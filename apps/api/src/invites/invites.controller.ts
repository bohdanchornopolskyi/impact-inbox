import { Get, Controller, Query } from "@nestjs/common";
import { type InvitePreviewData } from "@repo/shared";
import { Public } from "src/auth/decorators/public.decorator";
import { InvitesService } from "src/invites/invites.service";

@Controller("invites")
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Public()
  @Get("preview")
  preview(@Query("token") token: string): Promise<InvitePreviewData> {
    return this.invitesService.preview(token);
  }
}
