import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { accounts, Transaction, type Database } from "@repo/db";
import { eq } from "drizzle-orm";
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
    const [account] = await (tx ?? this.db)
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (!account) {
      throw new NotFoundException("Account not found.");
    }
    return account;
  }
}
