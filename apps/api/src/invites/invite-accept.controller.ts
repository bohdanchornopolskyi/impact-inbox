import { Body, Controller, Post } from "@nestjs/common";
import {
  type InviteAcceptResultData,
  type UserProfileData,
} from "@repo/shared";
import { Public } from "src/auth/decorators/public.decorator";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { InviteAcceptDto } from "src/invites/dto/invite-accept.dto";
import { InvitesService } from "src/invites/invites.service";
import { RegistrationService } from "src/onboarding/registration.service";

@Controller("invites")
export class InviteAcceptController {
  constructor(
    private readonly invitesService: InvitesService,
    private readonly registrationService: RegistrationService,
  ) {}

  @Public()
  @Post("accept")
  accept(
    @Body() dto: InviteAcceptDto,
    @CurrentUser() user?: UserProfileData,
  ): Promise<InviteAcceptResultData> {
    return this.invitesService.acceptInvite(dto, user, (signUpDto) =>
      this.registrationService.signUp(signUpDto),
    );
  }
}
