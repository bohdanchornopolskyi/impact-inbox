import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, AccountsService],
  exports: [AuthService],
})
export class AuthModule {}
