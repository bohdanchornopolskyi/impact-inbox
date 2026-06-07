import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CredentialService } from "./credential.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "src/auth/auth.guard";
import { UsersModule } from "src/users/users.module";
import { AccountsModule } from "src/accounts/accounts.module";
import { EmailModule } from "src/email/email.module";
import { AuthTokensModule } from "./auth-tokens.module";
import { EmailVerificationModule } from "./email-verification.module";
import { SessionsModule } from "./sessions.module";
import { OnboardingModule } from "src/onboarding/onboarding.module";

@Module({
  imports: [
    UsersModule,
    AccountsModule,
    EmailModule,
    AuthTokensModule,
    EmailVerificationModule,
    SessionsModule,
    OnboardingModule,
  ],
  controllers: [AuthController],
  providers: [
    CredentialService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [CredentialService, SessionsModule],
})
export class AuthModule {}
