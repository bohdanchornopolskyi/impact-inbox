import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { CredentialService } from "./credential.service";
import { SessionsService } from "./sessions.service";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { AuthTokensService } from "./auth-tokens.service";
import { EmailService } from "src/email/email.service";
import { OrganizationsService } from "src/organizations/organizations.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { INVALID_CREDENTIALS_MESSAGE } from "@repo/shared";

describe("CredentialService", () => {
  let service: CredentialService;
  let sessionsService: SessionsService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockAccountsService = {
    verifyPassword: jest.fn(),
    getAccountByUserId: jest.fn(),
    setPassword: jest.fn(),
  };

  const mockAuthTokensService = {
    createToken: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockOrganizationsService = {
    startTrialIfEligible: jest.fn(),
  };

  const mockDb = {
    insert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialService,
        SessionsService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: AuthTokensService, useValue: mockAuthTokensService },
        { provide: EmailService, useValue: mockEmailService },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<CredentialService>(CredentialService);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    const credentials = {
      email: "test@example.com",
      password: "Password1!",
    };

    it("returns a token for valid credentials", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({
        id: "user-1",
        emailVerifiedAt: new Date(),
      });
      mockAccountsService.verifyPassword.mockResolvedValue(true);
      jest.spyOn(sessionsService, "createSession").mockResolvedValue({
        token: "session-token",
      } as never);

      await expect(service.signIn(credentials)).resolves.toEqual({
        token: "session-token",
      });
      expect(mockOrganizationsService.startTrialIfEligible).toHaveBeenCalledWith(
        "user-1",
        expect.any(Date),
      );
    });

    it("throws the same unauthorized error when the user does not exist", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(undefined);

      await expect(service.signIn(credentials)).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
      expect(mockAccountsService.verifyPassword).not.toHaveBeenCalled();
    });

    it("throws the same unauthorized error when the password is wrong", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: "user-1" });
      mockAccountsService.verifyPassword.mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
    });
  });

  describe("changePassword", () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
      name: "Test",
      emailVerifiedAt: null,
    };

    it("updates the password when the current password is valid", async () => {
      mockAccountsService.getAccountByUserId.mockResolvedValue({
        password: "hash",
      });
      mockAccountsService.verifyPassword.mockResolvedValue(true);
      mockAccountsService.setPassword.mockResolvedValue({});

      await expect(
        service.changePassword(user, {
          currentPassword: "Password1!",
          newPassword: "NewPassword1!",
          confirmNewPassword: "NewPassword1!",
        }),
      ).resolves.toEqual({ success: true });

      expect(mockAccountsService.setPassword).toHaveBeenCalledWith(
        "user-1",
        "NewPassword1!",
      );
    });

    it("rejects an invalid current password", async () => {
      mockAccountsService.getAccountByUserId.mockResolvedValue({
        password: "hash",
      });
      mockAccountsService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.changePassword(user, {
          currentPassword: "wrong",
          newPassword: "NewPassword1!",
          confirmNewPassword: "NewPassword1!",
        }),
      ).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
    });
  });
});
