import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { type Database } from "@repo/db";
import {
  INVALID_CREDENTIALS_MESSAGE,
  type SuccessData,
  type UserProfileData,
} from "@repo/shared";
import { toUserProfile } from "src/common/mappers/user.mapper";
import { AccountsService } from "src/accounts/accounts.service";
import { EmailVerificationService } from "src/auth/email-verification.service";
import { UsersService } from "src/users/users.service";
import { DeleteAccountDto } from "src/users/dto/delete-account.dto";
import { UpdateProfileDto } from "src/users/dto/update-profile.dto";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class UserLifecycleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly emailVerificationService: EmailVerificationService,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
  ) {}

  async updateProfile(
    user: UserProfileData,
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
      return toUserProfile(updatedUser);
    }

    const updatedUser = await this.usersService.updateUser(user.id, dto);
    return toUserProfile(updatedUser);
  }

  async deleteAccount(
    user: UserProfileData,
    dto: DeleteAccountDto,
  ): Promise<SuccessData> {
    const account = await this.accountsService.getAccountByUserId(user.id);

    if (!account.password) {
      throw new BadRequestException("Password authentication is not available");
    }

    const passwordsMatch = await this.accountsService.verifyPassword(
      user.id,
      dto.password,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    await this.usersService.deleteUser(user.id);

    return { success: true };
  }
}
