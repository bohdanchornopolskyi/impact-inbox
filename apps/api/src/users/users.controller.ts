import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersSelect } from "@repo/db";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get(":id")
  async getUserById(@Param("id") id: string): Promise<UsersSelect> {
    return await this.usersService.getUserById(id);
  }
}
