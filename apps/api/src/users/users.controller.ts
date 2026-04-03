import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersSelect } from "@repo/db";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get(":id")
  async getUserById(@Param("id") id: string): Promise<UsersSelect> {
    return await this.usersService.getUserById(id);
  }

  @Post()
  async createUser(@Body() createUserDTO: CreateUserDto) {
    return await this.usersService.createUser(createUserDTO);
  }
}
