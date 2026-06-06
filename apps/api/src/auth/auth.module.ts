import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "src/auth/auth.guard";
import { UsersModule } from "src/users/users.module";
import { AccountsModule } from "src/accounts/accounts.module";

import { WorkspacesModule } from "src/workspaces/workspaces.module";

@Module({
  imports: [UsersModule, AccountsModule, WorkspacesModule],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService],
})
export class AuthModule {}
