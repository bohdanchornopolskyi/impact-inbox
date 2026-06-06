import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { type Transaction } from "@repo/db";
import { type SuccessData } from "@repo/shared";
import { AuthTokensService } from "src/auth/auth-tokens.service";
import { EmailService } from "src/email/email.service";
import { UsersService } from "src/users/users.service";
import { ConfirmEmailDto } from "src/auth/dto/confirm-email.dto";
import { type UsersSelect } from "@repo/db";

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly authTokensService: AuthTokensService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async requestEmailVerification(
    userId: string,
    email: string,
    tx?: Transaction,
  ): Promise<string> {
    const verificationToken = await this.authTokensService.createToken(
      userId,
      "email_verification",
      tx,
    );

    if (!tx) {
      await this.emailService.sendVerificationEmail(
        email,
        verificationToken.token,
      );
    }

    return verificationToken.token;
  }

  async dispatchVerificationEmail(email: string, token: string): Promise<void> {
    await this.emailService.sendVerificationEmail(email, token);
  }

  async resendVerification(user: UsersSelect): Promise<SuccessData> {
    if (user.emailVerifiedAt) {
      throw new BadRequestException("Email is already verified");
    }

    await this.requestEmailVerification(user.id, user.email);

    return { success: true };
  }

  async confirmEmail(dto: ConfirmEmailDto): Promise<SuccessData> {
    const token = await this.authTokensService.consumeToken(
      dto.token,
      "email_verification",
    );
    await this.usersService.verifyEmail(token.userId);

    return { success: true };
  }
}
