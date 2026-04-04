import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { CreateSessionDto } from "src/auth/dto/create-session.dto";
import { db, sessions, Transaction, users } from "@repo/db";
import { eq } from "drizzle-orm";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { randomUUID } from "crypto";
import * as argon2 from "argon2";
import { SESSION_EXPIRES_AT } from "@repo/shared";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
  ) {}
  async createSession(session: CreateSessionDto, tx?: Transaction) {
    const [createdSession] = await (tx ?? db)
      .insert(sessions)
      .values(session)
      .returning();
    if (!createdSession) {
      throw new InternalServerErrorException("Session creation failed.");
    }
    return createdSession;
  }

  async getSessionById(id: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    if (!session) {
      throw new NotFoundException(`Session not found`);
    }
    return session;
  }

  async getSessionsByUserId(userId: string) {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId));
    if (!userSessions.length) {
      throw new NotFoundException(`Session not found`);
    }
    return userSessions;
  }

  async getSessionByToken(token: string) {
    const [userSessions] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    if (!userSessions) {
      throw new NotFoundException(`Session not found`);
    }
    return userSessions;
  }

  async deleteSession(id: string) {
    const [deletedSession] = await db
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning();

    if (!deletedSession) {
      throw new NotFoundException(`Session not found`);
    }

    return deletedSession;
  }

  async validateSession(token: string) {
    const session = await this.getSessionByToken(token);
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session expired");
    }
    const user = await this.usersService.getUserById(session.userId);

    return { session, user };
  }

  async SignUp(signUpDTO: SignUpDto) {
    const { email, password, name } = signUpDTO;
    const [userExist] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (userExist) {
      throw new ConflictException("User already exists");
    }
    const token = randomUUID();
    const passwordHash = await argon2.hash(password);
    return db.transaction(async (tx) => {
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
      const createdSession = await this.createSession(
        {
          userId: createdUser.id,
          token,
          expiresAt: new Date(Date.now() + SESSION_EXPIRES_AT),
        },
        tx,
      );
      return { token: createdSession.token };
    });
  }
}
