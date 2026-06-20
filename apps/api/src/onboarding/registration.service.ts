import {
  ConflictException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { WorkspacesService } from "src/workspaces/workspaces.service";
import { OrganizationsService } from "src/organizations/organizations.service";
import { SessionsService } from "src/auth/sessions.service";
import { EmailVerificationService } from "src/auth/email-verification.service";
import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { randomUUID } from "crypto";
import { SESSION_EXPIRES_AT, type AuthTokenData } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import type { Database } from "@repo/db";

@Injectable()
export class RegistrationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly organizationsService: OrganizationsService,
    private readonly workspacesService: WorkspacesService,
    private readonly sessionsService: SessionsService,
    private readonly emailVerificationService: EmailVerificationService,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
  ) {}

  async signUp(signUpDTO: SignUpDto): Promise<AuthTokenData> {
    const { email, password, name } = signUpDTO;
    const userExist = await this.usersService.findUserByEmail({ email });
    if (userExist) {
      throw new ConflictException("User already exists");
    }

    const token = randomUUID();

    const { sessionToken, verificationToken, userEmail } =
      await this.db.transaction(async (tx) => {
        const createdUser = await this.usersService.createUser(
          { name, email },
          tx,
        );
        await this.accountsService.createAccount(
          { userId: createdUser.id },
          tx,
        );
        await this.accountsService.setPassword(createdUser.id, password, tx);
        const organization =
          await this.organizationsService.createDefaultOrganizationForUser(
            createdUser.id,
            createdUser.name,
            tx,
          );
        await this.workspacesService.createDefaultWorkspaceForUser(
          createdUser.id,
          createdUser.name,
          organization.id,
          tx,
        );
        const createdSession = await this.sessionsService.createSession(
          {
            userId: createdUser.id,
            token,
            expiresAt: new Date(Date.now() + SESSION_EXPIRES_AT),
          },
          tx,
        );
        const verificationToken =
          await this.emailVerificationService.requestEmailVerification(
            createdUser.id,
            createdUser.email,
            tx,
          );
        return {
          sessionToken: createdSession.token,
          verificationToken,
          userEmail: createdUser.email,
        };
      });

    await this.emailVerificationService.dispatchVerificationEmail(
      userEmail,
      verificationToken,
    );

    return { token: sessionToken };
  }
}
