import { Controller, Get } from "@nestjs/common";
import { UsersSelect } from "@repo/db";
import { type UserProfileData } from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  @Get("me")
  getMe(@CurrentUser() user: UsersSelect): UserProfileData {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
