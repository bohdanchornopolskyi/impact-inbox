import { Body, Controller, Delete, Get, Patch } from "@nestjs/common";
import { UsersSelect } from "@repo/db";
import { type UserProfileData, type SuccessData } from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { AuthService } from "src/auth/auth.service";
import { AuthTokensService } from "src/auth/auth-tokens.service";
import { EmailService } from "src/email/email.service";
import { UsersService } from "src/users/users.service";
import { UpdateProfileDto } from "src/users/dto/update-profile.dto";
import { DeleteAccountDto } from "src/users/dto/delete-account.dto";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly authTokensService: AuthTokensService,
    private readonly emailService: EmailService,
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: UsersSelect): UserProfileData {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  @Patch("me")
  async updateMe(
    @CurrentUser() user: UsersSelect,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileData> {
    const updatedUser = await this.usersService.updateUser(user.id, dto);

    if (dto.email) {
      const verificationToken = await this.authTokensService.createToken(
        updatedUser.id,
        "email_verification",
      );
      await this.emailService.sendVerificationEmail(
        updatedUser.email,
        verificationToken.token,
      );
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerifiedAt: updatedUser.emailVerifiedAt,
    };
  }

  @Delete("me")
  deleteMe(
    @CurrentUser() user: UsersSelect,
    @Body() dto: DeleteAccountDto,
  ): Promise<SuccessData> {
    return this.authService.deleteAccount(user, dto);
  }
}
