import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

function getWebOrigin(): string {
  return process.env.WEB_ORIGIN ?? "http://localhost:3000";
}

function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Impact Inbox <onboarding@resend.dev>";
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = getEmailFrom();
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${getWebOrigin()}/verify-email?token=${encodeURIComponent(token)}`;

    if (!this.resend) {
      this.logger.log(
        `Verification email for ${email}: ${verifyUrl}`,
      );
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: "Verify your email",
      html: this.buildVerificationHtml(verifyUrl),
      text: `Verify your email address: ${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${getWebOrigin()}/reset-password?token=${encodeURIComponent(token)}`;

    if (!this.resend) {
      this.logger.log(`Password reset email for ${email}: ${resetUrl}`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: "Reset your password",
      html: this.buildPasswordResetHtml(resetUrl),
      text: `Reset your password: ${resetUrl}`,
    });
  }

  private buildVerificationHtml(verifyUrl: string): string {
    return `
      <div style="font-family:Geist,-apple-system,BlinkMacSystemFont,sans-serif;color:#18181b;line-height:1.5;">
        <h1 style="font-size:21px;font-weight:600;margin:0 0 12px;">Verify your email</h1>
        <p style="font-size:13px;color:#52525b;margin:0 0 20px;">
          Confirm your email address to finish setting up your Impact Inbox account.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">
          Verify email
        </a>
        <p style="font-size:12px;color:#71717a;margin:20px 0 0;">
          If you did not create an account, you can ignore this email.
        </p>
      </div>
    `.trim();
  }

  private buildPasswordResetHtml(resetUrl: string): string {
    return `
      <div style="font-family:Geist,-apple-system,BlinkMacSystemFont,sans-serif;color:#18181b;line-height:1.5;">
        <h1 style="font-size:21px;font-weight:600;margin:0 0 12px;">Reset your password</h1>
        <p style="font-size:13px;color:#52525b;margin:0 0 20px;">
          Use the link below to choose a new password for your Impact Inbox account.
        </p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">
          Reset password
        </a>
        <p style="font-size:12px;color:#71717a;margin:20px 0 0;">
          If you did not request a reset, you can ignore this email.
        </p>
      </div>
    `.trim();
  }
}
