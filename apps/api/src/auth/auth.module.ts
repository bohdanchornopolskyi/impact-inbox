import { Module, forwardRef } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthTokensService } from "./auth-tokens.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "src/auth/auth.guard";
import { UsersModule } from "src/users/users.module";
import { AccountsModule } from "src/accounts/accounts.module";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    AccountsModule,
    forwardRef(() => WorkspacesModule),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokensService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, AuthTokensService],
})
export class AuthModule {}
