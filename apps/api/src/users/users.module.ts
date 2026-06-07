import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserLifecycleService } from "./user-lifecycle.service";
import { UsersController } from "./users.controller";
import { AccountsModule } from "src/accounts/accounts.module";
import { EmailVerificationModule } from "src/auth/email-verification.module";

@Module({
  imports: [AccountsModule, EmailVerificationModule],
  controllers: [UsersController],
  providers: [UsersService, UserLifecycleService],
  exports: [UsersService],
})
export class UsersModule {}
