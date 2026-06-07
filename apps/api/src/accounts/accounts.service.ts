import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { accounts, Transaction, type Database } from "@repo/db";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { CreateAccountDto } from "src/accounts/dto/create-account.dto";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class AccountsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async createAccount(createAccountDTO: CreateAccountDto, tx?: Transaction) {
    const [createdAccount] = await (tx ?? this.db)
      .insert(accounts)
      .values(createAccountDTO)
      .returning();
    if (!createdAccount) {
      throw new InternalServerErrorException("Account creation failed.");
    }
    return createdAccount;
  }

  async getAccountByUserId(userId: string, tx?: Transaction) {
    const account = await this.findAccountByUserId(userId, tx);
    if (!account) {
      throw new NotFoundException("Account not found.");
    }
    return account;
  }

  async findAccountByUserId(userId: string, tx?: Transaction) {
    const [account] = await (tx ?? this.db)
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    return account;
  }

  async verifyPassword(
    userId: string,
    plainPassword: string,
    tx?: Transaction,
  ): Promise<boolean> {
    const account = await this.findAccountByUserId(userId, tx);
    if (!account?.password) {
      return false;
    }
    return argon2.verify(account.password, plainPassword);
  }

  async setPassword(userId: string, plainPassword: string, tx?: Transaction) {
    const passwordHash = await argon2.hash(plainPassword);
    const [updatedAccount] = await (tx ?? this.db)
      .update(accounts)
      .set({ password: passwordHash })
      .where(eq(accounts.userId, userId))
      .returning();

    if (!updatedAccount) {
      throw new NotFoundException("Account not found.");
    }

    return updatedAccount;
  }
}
