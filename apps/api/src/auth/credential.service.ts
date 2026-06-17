import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { SessionsService } from "src/auth/sessions.service";
import { AuthTokensService } from "src/auth/auth-tokens.service";
import { EmailService } from "src/email/email.service";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { randomUUID } from "crypto";
import {
  INVALID_CREDENTIALS_MESSAGE,
  SESSION_EXPIRES_AT,
  type AuthTokenData,
  type SignOutData,
  type SuccessData,
} from "@repo/shared";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { ForgotPasswordDto } from "src/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/auth/dto/reset-password.dto";
import { type UserProfileData } from "@repo/shared";

@Injectable()
export class CredentialService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly sessionsService: SessionsService,
    private readonly authTokensService: AuthTokensService,
    private readonly emailService: EmailService,
  ) {}

  async signIn(signInDTO: SignInDto): Promise<AuthTokenData> {
    const { email, password } = signInDTO;
    const user = await this.usersService.findUserByEmail({ email });

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordsMatch = await this.accountsService.verifyPassword(
      user.id,
      password,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = randomUUID();
    const createdSession = await this.sessionsService.createSession({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + SESSION_EXPIRES_AT),
    });
    return { token: createdSession.token };
  }

  async signOut(token: string): Promise<SignOutData> {
    await this.sessionsService.deleteSession(token);
    return { success: true };
  }

  async changePassword(
    user: UserProfileData,
    dto: ChangePasswordDto,
  ): Promise<SuccessData> {
    const account = await this.accountsService.getAccountByUserId(user.id);

    if (!account.password) {
      throw new BadRequestException("Password authentication is not available");
    }

    const passwordsMatch = await this.accountsService.verifyPassword(
      user.id,
      dto.currentPassword,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    await this.accountsService.setPassword(user.id, dto.newPassword);

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<SuccessData> {
    const user = await this.usersService.findUserByEmail({ email: dto.email });

    if (user) {
      const resetToken = await this.authTokensService.createToken(
        user.id,
        "password_reset",
      );
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken.token,
      );
    }

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<SuccessData> {
    const token = await this.authTokensService.consumeToken(
      dto.token,
      "password_reset",
    );
    await this.accountsService.setPassword(token.userId, dto.newPassword);

    return { success: true };
  }
}
