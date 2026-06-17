import { Body, Controller, Delete, Get, Patch } from "@nestjs/common";
import { type UserProfileData, type SuccessData } from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UserLifecycleService } from "src/users/user-lifecycle.service";
import { UpdateProfileDto } from "src/users/dto/update-profile.dto";
import { DeleteAccountDto } from "src/users/dto/delete-account.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly userLifecycleService: UserLifecycleService) {}

  @Get("me")
  getMe(@CurrentUser() user: UserProfileData): UserProfileData {
    return user;
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: UserProfileData,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileData> {
    return this.userLifecycleService.updateProfile(user, dto);
  }

  @Delete("me")
  deleteMe(
    @CurrentUser() user: UserProfileData,
    @Body() dto: DeleteAccountDto,
  ): Promise<SuccessData> {
    return this.userLifecycleService.deleteAccount(user, dto);
  }
}
