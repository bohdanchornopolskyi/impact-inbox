import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { WorkspacesService } from "src/workspaces/workspaces.service";
import { AuthTokensService } from "src/auth/auth-tokens.service";
import { EmailService } from "src/email/email.service";
import { CreateSessionDto } from "src/auth/dto/create-session.dto";
import { sessions, Transaction, users } from "@repo/db";
import { eq } from "drizzle-orm";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { randomUUID } from "crypto";
import * as argon2 from "argon2";
import {
  INVALID_CREDENTIALS_MESSAGE,
  SESSION_EXPIRES_AT,
  type AuthTokenData,
  type SessionData,
  type SignOutData,
  type SuccessData,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database, SessionsSelect, UsersSelect } from "@repo/db";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { ForgotPasswordDto } from "src/auth/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/auth/dto/reset-password.dto";
import { ConfirmEmailDto } from "src/auth/dto/confirm-email.dto";
import { DeleteAccountDto } from "src/users/dto/delete-account.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly workspacesService: WorkspacesService,
    private readonly authTokensService: AuthTokensService,
    private readonly emailService: EmailService,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
  ) {}

  async createSession(
    session: CreateSessionDto,
    tx?: Transaction,
  ): Promise<SessionsSelect> {
    const [createdSession] = await (tx ?? this.db)
      .insert(sessions)
      .values(session)
      .returning();
    if (!createdSession) {
      throw new InternalServerErrorException("Session creation failed.");
    }
    return createdSession;
  }

  async getSessionById(id: string) {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    if (!session) {
      throw new NotFoundException(`Session not found`);
    }
    return session;
  }

  async getSessionByToken(token: string): Promise<SessionsSelect> {
    const [userSessions] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    if (!userSessions) {
      throw new NotFoundException(`Session not found`);
    }
    return userSessions;
  }

  async deleteSession(token: string): Promise<SessionsSelect> {
    const [deletedSession] = await this.db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .returning();

    if (!deletedSession) {
      throw new NotFoundException(`Session not found`);
    }

    return deletedSession;
  }

  async deleteSessionById(userId: string, sessionId: string): Promise<void> {
    const [deletedSession] = await this.db
      .delete(sessions)
      .where(eq(sessions.id, sessionId))
      .returning();

    if (!deletedSession || deletedSession.userId !== userId) {
      throw new NotFoundException("Session not found");
    }
  }

  async validateSession(token: string) {
    const session: SessionsSelect = await this.getSessionByToken(token);
    if (session.expiresAt < new Date()) {
      await this.deleteSession(session.token);
      throw new UnauthorizedException("Session expired");
    }
    const user = await this.usersService.getUserById(session.userId);

    return { session, user };
  }

  async signUp(signUpDTO: SignUpDto): Promise<AuthTokenData> {
    const { email, password, name } = signUpDTO;
    const [userExist] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (userExist) {
      throw new ConflictException("User already exists");
    }
    const token = randomUUID();
    const passwordHash = await argon2.hash(password);
    const authToken = await this.db.transaction(async (tx) => {
      const createdUser = await this.usersService.createUser(
        { name, email },
        tx,
      );
      await this.accountsService.createAccount(
        {
          userId: createdUser.id,
          password: passwordHash,
        },
        tx,
      );
      await this.workspacesService.createDefaultWorkspaceForUser(
        createdUser.id,
        createdUser.name,
        tx,
      );
      const createdSession = await this.createSession(
        {
          userId: createdUser.id,
          token,
          expiresAt: new Date(Date.now() + SESSION_EXPIRES_AT),
        },
        tx,
      );
      const verificationToken = await this.authTokensService.createToken(
        createdUser.id,
        "email_verification",
        tx,
      );
      await this.emailService.sendVerificationEmail(
        createdUser.email,
        verificationToken.token,
      );
      return { token: createdSession.token };
    });
    return authToken;
  }

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
    const createdSession = await this.createSession({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + SESSION_EXPIRES_AT),
    });
    return { token: createdSession.token };
  }

  async signOut(token: string): Promise<SignOutData> {
    await this.deleteSession(token);
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

  async confirmEmail(dto: ConfirmEmailDto): Promise<SuccessData> {
    const token = await this.authTokensService.consumeToken(
      dto.token,
      "email_verification",
    );
    await this.usersService.verifyEmail(token.userId);

    return { success: true };
  }

  async resendVerification(user: UsersSelect): Promise<SuccessData> {
    if (user.emailVerifiedAt) {
      throw new BadRequestException("Email is already verified");
    }

    const verificationToken = await this.authTokensService.createToken(
      user.id,
      "email_verification",
    );
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken.token,
    );

    return { success: true };
  }

  async listSessions(
    userId: string,
    currentToken: string,
  ): Promise<SessionData[]> {
    const userSessions = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId));

    return userSessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.token === currentToken,
    }));
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    currentToken: string,
  ): Promise<SuccessData> {
    const session = await this.getSessionById(sessionId);

    if (session.userId !== userId) {
      throw new NotFoundException("Session not found");
    }

    if (session.token === currentToken) {
      throw new BadRequestException("Cannot revoke the current session");
    }

    await this.deleteSessionById(userId, sessionId);

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
