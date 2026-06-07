import { Module } from "@nestjs/common";
import { EmailVerificationService } from "./email-verification.service";
import { AuthTokensModule } from "./auth-tokens.module";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [AuthTokensModule, EmailModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
