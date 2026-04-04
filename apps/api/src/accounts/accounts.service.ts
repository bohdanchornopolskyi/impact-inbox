import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { db, accounts, Transaction } from "@repo/db";
import { eq } from "drizzle-orm";
import { CreateAccountDto } from "src/accounts/dto/create-account.dto";

@Injectable()
export class AccountsService {
  async createAccount(createAccountDTO: CreateAccountDto, tx?: Transaction) {
    const [createdAccount] = await (tx ?? db)
      .insert(accounts)
      .values(createAccountDTO)
      .returning();
    if (!createdAccount) {
      throw new InternalServerErrorException("Account creation failed.");
    }
    return createdAccount;
  }

  async getAccountByUserId(userId: string, tx?: Transaction) {
    const [account] = await (tx ?? db)
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (!account) {
      throw new NotFoundException("Account not found.");
    }
    return account;
  }
}
