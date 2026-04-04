import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { db, accounts, Transaction } from "@repo/db";
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
}
