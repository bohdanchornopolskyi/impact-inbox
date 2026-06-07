import { Module } from "@nestjs/common";
import { RegistrationService } from "./registration.service";
import { UsersModule } from "src/users/users.module";
import { AccountsModule } from "src/accounts/accounts.module";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { SessionsModule } from "src/auth/sessions.module";
import { EmailVerificationModule } from "src/auth/email-verification.module";

@Module({
  imports: [
    UsersModule,
    AccountsModule,
    WorkspacesModule,
    SessionsModule,
    EmailVerificationModule,
  ],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class OnboardingModule {}
