import { Module, forwardRef } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthTokensService } from "./auth-tokens.service";
import { SessionsService } from "./sessions.service";
import { RegistrationService } from "./registration.service";
import { CredentialService } from "./credential.service";
import { EmailVerificationService } from "./email-verification.service";
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
    SessionsService,
    RegistrationService,
    CredentialService,
    EmailVerificationService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AuthService, AuthTokensService, EmailVerificationService],
})
export class AuthModule {}
