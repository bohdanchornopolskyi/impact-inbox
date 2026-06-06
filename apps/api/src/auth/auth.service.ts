import { Inject, Injectable } from "@nestjs/common";
import { UsersSelect } from "@repo/db";
import {
  type AuthTokenData,
  type SessionData,
  type SignOutData,
  type SuccessData,
  type UserProfileData,
} from "@repo/shared";
import { SessionsService } from "src/auth/sessions.service";
import { RegistrationService } from "src/auth/registration.service";
import { CredentialService } from "src/auth/credential.service";
import { EmailVerificationService } from "src/auth/email-verification.service";
import { UsersService } from "src/users/users.service";
import { CreateSessionDto } from "src/auth/dto/create-session.dto";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { ForgotPasswordDto } from "src/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/auth/dto/reset-password.dto";
import { ConfirmEmailDto } from "src/auth/dto/confirm-email.dto";
import { DeleteAccountDto } from "src/users/dto/delete-account.dto";
import { UpdateProfileDto } from "src/users/dto/update-profile.dto";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database, SessionsSelect, Transaction } from "@repo/db";

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly registrationService: RegistrationService,
    private readonly credentialService: CredentialService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly usersService: UsersService,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
  ) {}

  createSession(
    session: CreateSessionDto,
    tx?: Transaction,
  ): Promise<SessionsSelect> {
    return this.sessionsService.createSession(session, tx);
  }

  getSessionById(id: string) {
    return this.sessionsService.getSessionById(id);
  }

  getSessionByToken(token: string): Promise<SessionsSelect> {
    return this.sessionsService.getSessionByToken(token);
  }

  deleteSession(token: string): Promise<SessionsSelect> {
    return this.sessionsService.deleteSession(token);
  }

  deleteSessionById(userId: string, sessionId: string): Promise<void> {
    return this.sessionsService.deleteSessionById(userId, sessionId);
  }

  validateSession(token: string) {
    return this.sessionsService.validateSession(token);
  }

  signUp(signUpDTO: SignUpDto): Promise<AuthTokenData> {
    return this.registrationService.signUp(signUpDTO);
  }

  signIn(signInDTO: SignInDto): Promise<AuthTokenData> {
    return this.credentialService.signIn(signInDTO);
  }

  signOut(token: string): Promise<SignOutData> {
    return this.credentialService.signOut(token);
  }

  changePassword(
    user: UsersSelect,
    dto: ChangePasswordDto,
  ): Promise<SuccessData> {
    return this.credentialService.changePassword(user, dto);
  }

  forgotPassword(dto: ForgotPasswordDto): Promise<SuccessData> {
    return this.credentialService.forgotPassword(dto);
  }

  resetPassword(dto: ResetPasswordDto): Promise<SuccessData> {
    return this.credentialService.resetPassword(dto);
  }

  confirmEmail(dto: ConfirmEmailDto): Promise<SuccessData> {
    return this.emailVerificationService.confirmEmail(dto);
  }

  resendVerification(user: UsersSelect): Promise<SuccessData> {
    return this.emailVerificationService.resendVerification(user);
  }

  listSessions(userId: string, currentToken: string): Promise<SessionData[]> {
    return this.sessionsService.listSessions(userId, currentToken);
  }

  revokeSession(
    userId: string,
    sessionId: string,
    currentToken: string,
  ): Promise<SuccessData> {
    return this.sessionsService.revokeSession(userId, sessionId, currentToken);
  }

  deleteAccount(
    user: UsersSelect,
    dto: DeleteAccountDto,
  ): Promise<SuccessData> {
    return this.credentialService.deleteAccount(user, dto);
  }

  async updateProfile(
    user: UsersSelect,
    dto: UpdateProfileDto,
  ): Promise<UserProfileData> {
    if (dto.email) {
      const { updatedUser, verificationToken } = await this.db.transaction(
        async (tx) => {
          const updatedUser = await this.usersService.updateUser(
            user.id,
            dto,
            tx,
          );
          const verificationToken =
            await this.emailVerificationService.requestEmailVerification(
              updatedUser.id,
              updatedUser.email,
              tx,
            );
          return { updatedUser, verificationToken };
        },
      );
      await this.emailVerificationService.dispatchVerificationEmail(
        updatedUser.email,
        verificationToken,
      );
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
      };
    }

    const updatedUser = await this.usersService.updateUser(user.id, dto);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerifiedAt: updatedUser.emailVerifiedAt,
    };
  }
}
