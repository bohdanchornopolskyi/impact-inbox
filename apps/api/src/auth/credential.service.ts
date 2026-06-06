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
import * as argon2 from "argon2";
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
import { DeleteAccountDto } from "src/users/dto/delete-account.dto";
import { type UsersSelect } from "@repo/db";

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
    const account = user
      ? await this.accountsService.findAccountByUserId(user.id)
      : undefined;

    if (!user || !account?.password) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordsMatch = await argon2.verify(account.password, password);
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
    user: UsersSelect,
    dto: ChangePasswordDto,
  ): Promise<SuccessData> {
    const account = await this.accountsService.getAccountByUserId(user.id);

    if (!account.password) {
      throw new BadRequestException("Password authentication is not available");
    }

    const passwordsMatch = await argon2.verify(
      account.password,
      dto.currentPassword,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.accountsService.updatePassword(user.id, passwordHash);

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
    const passwordHash = await argon2.hash(dto.newPassword);
    await this.accountsService.updatePassword(token.userId, passwordHash);

    return { success: true };
  }

  async deleteAccount(
    user: UsersSelect,
    dto: DeleteAccountDto,
  ): Promise<SuccessData> {
    const account = await this.accountsService.getAccountByUserId(user.id);

    if (!account.password) {
      throw new BadRequestException("Password authentication is not available");
    }

    const passwordsMatch = await argon2.verify(account.password, dto.password);
    if (!passwordsMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    await this.usersService.deleteUser(user.id);

    return { success: true };
  }
}
