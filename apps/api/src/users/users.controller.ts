import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersSelect } from "@repo/db";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
