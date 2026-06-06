import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    this.logger.log(`Verification email for ${email}: token=${token}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    this.logger.log(`Password reset email for ${email}: token=${token}`);
  }
}
