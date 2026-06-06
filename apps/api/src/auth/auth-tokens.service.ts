import {
  BadRequestException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  authTokens,
  type AuthTokenType,
  type AuthTokensSelect,
  type Database,
  type Transaction,
} from "@repo/db";
import {
  EMAIL_VERIFICATION_EXPIRES_AT,
  PASSWORD_RESET_EXPIRES_AT,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class AuthTokensService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async createToken(
    userId: string,
    type: AuthTokenType,
    tx?: Transaction,
  ): Promise<AuthTokensSelect> {
    const expiresAt =
      type === "email_verification"
        ? new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_AT)
        : new Date(Date.now() + PASSWORD_RESET_EXPIRES_AT);

    await this.invalidateActiveTokens(userId, type, tx);

    const [token] = await (tx ?? this.db)
      .insert(authTokens)
      .values({
        userId,
        token: randomUUID(),
        type,
        expiresAt,
      })
      .returning();

    if (!token) {
      throw new BadRequestException("Token creation failed");
    }

    return token;
  }

  async consumeToken(
    tokenValue: string,
    type: AuthTokenType,
    tx?: Transaction,
  ): Promise<AuthTokensSelect> {
    const token = await this.findValidToken(tokenValue, type, tx);

    const [usedToken] = await (tx ?? this.db)
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, token.id))
      .returning();

    if (!usedToken) {
      throw new BadRequestException("Invalid or expired token");
    }

    return usedToken;
  }

  async findValidToken(
    tokenValue: string,
    type: AuthTokenType,
    tx?: Transaction,
  ): Promise<AuthTokensSelect> {
    const [token] = await (tx ?? this.db)
      .select()
      .from(authTokens)
      .where(
        and(
          eq(authTokens.token, tokenValue),
          eq(authTokens.type, type),
          isNull(authTokens.usedAt),
        ),
      );

    if (!token || token.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired token");
    }

    return token;
  }

  private async invalidateActiveTokens(
    userId: string,
    type: AuthTokenType,
    tx?: Transaction,
  ): Promise<void> {
    await (tx ?? this.db)
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(authTokens.userId, userId),
          eq(authTokens.type, type),
          isNull(authTokens.usedAt),
        ),
      );
  }
}
