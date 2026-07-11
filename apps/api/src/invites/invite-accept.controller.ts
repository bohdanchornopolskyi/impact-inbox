import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  forwardRef,
} from "@nestjs/common";
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
    @Inject(forwardRef(() => RegistrationService))
    private readonly registrationService: RegistrationService,
  ) {}

  @Public()
  @Post("accept")
  async accept(
    @Body() dto: InviteAcceptDto,
    @CurrentUser() user?: UserProfileData,
  ): Promise<InviteAcceptResultData> {
    const wantsSignUp =
      dto.name !== undefined ||
      dto.password !== undefined ||
      dto.confirmPassword !== undefined;

    if (!wantsSignUp) {
      return this.invitesService.accept(dto, user);
    }

    if (user) {
      throw new BadRequestException(
        "Sign out before creating an account for this invite",
      );
    }

    if (!dto.name || !dto.password || !dto.confirmPassword) {
      throw new BadRequestException("Sign-up fields are required");
    }

    const preview = await this.invitesService.preview(dto.token);

    if (preview.revoked) {
      throw new BadRequestException("Invite has been revoked");
    }

    if (preview.accepted) {
      throw new BadRequestException("Invite has already been accepted");
    }

    if (preview.expired) {
      throw new BadRequestException("Invite has expired");
    }

    const signUpResult = await this.registrationService.signUp({
      email: preview.email,
      name: dto.name,
      password: dto.password,
      confirmPassword: dto.confirmPassword,
    });

    await this.invitesService.acceptForEmail(dto.token, preview.email);
    return { success: true, token: signUpResult.token };
  }
}
