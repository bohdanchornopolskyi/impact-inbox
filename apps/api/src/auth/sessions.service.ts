import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { CreateSessionDto } from "src/auth/dto/create-session.dto";
import { sessions, Transaction } from "@repo/db";
import { eq } from "drizzle-orm";
import { type SessionData, type SuccessData } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database, SessionsSelect } from "@repo/db";

@Injectable()
export class SessionsService {
  constructor(
    private readonly usersService: UsersService,
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
}
