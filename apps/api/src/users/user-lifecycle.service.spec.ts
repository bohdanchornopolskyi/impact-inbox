import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { UserLifecycleService } from "./user-lifecycle.service";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { EmailVerificationService } from "src/auth/email-verification.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { INVALID_CREDENTIALS_MESSAGE } from "@repo/shared";

describe("UserLifecycleService", () => {
  let service: UserLifecycleService;

  const user = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    emailVerifiedAt: null,
  };

  const mockUsersService = {
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockAccountsService = {
    getAccountByUserId: jest.fn(),
    verifyPassword: jest.fn(),
  };

  const mockEmailVerificationService = {
    requestEmailVerification: jest.fn(),
    dispatchVerificationEmail: jest.fn(),
  };

  const mockTx = { id: "tx" };

  const mockDb = {
    transaction: jest.fn((callback: (tx: typeof mockTx) => Promise<unknown>) =>
      callback(mockTx),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLifecycleService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: AccountsService, useValue: mockAccountsService },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<UserLifecycleService>(UserLifecycleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateProfile", () => {
    it("updates name without a transaction when email is unchanged", async () => {
      mockUsersService.updateUser.mockResolvedValue({
        ...user,
        name: "Updated",
      });

      await expect(
        service.updateProfile(user, { name: "Updated" }),
      ).resolves.toEqual({
        id: user.id,
        email: user.email,
        name: "Updated",
        emailVerifiedAt: null,
      });

      expect(mockDb.transaction).not.toHaveBeenCalled();
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(user.id, {
        name: "Updated",
      });
    });

    it("runs update and verification in one transaction when email changes", async () => {
      const updatedUser = {
        ...user,
        email: "new@example.com",
        emailVerifiedAt: null,
      };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);
      mockEmailVerificationService.requestEmailVerification.mockResolvedValue(
        "verify-token",
      );

      await expect(
        service.updateProfile(user, { email: "new@example.com" }),
      ).resolves.toEqual({
        id: user.id,
        email: "new@example.com",
        name: user.name,
        emailVerifiedAt: null,
      });

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        user.id,
        { email: "new@example.com" },
        mockTx,
      );
      expect(
        mockEmailVerificationService.requestEmailVerification,
      ).toHaveBeenCalledWith("user-1", "new@example.com", mockTx);
      expect(
        mockEmailVerificationService.dispatchVerificationEmail,
      ).toHaveBeenCalledWith("new@example.com", "verify-token");
    });
  });

  describe("deleteAccount", () => {
    it("deletes the user when the password is valid", async () => {
      mockAccountsService.getAccountByUserId.mockResolvedValue({
        password: "hash",
      });
      mockAccountsService.verifyPassword.mockResolvedValue(true);
      mockUsersService.deleteUser.mockResolvedValue(user);

      await expect(
        service.deleteAccount(user, { password: "Password1!" }),
      ).resolves.toEqual({ success: true });

      expect(mockAccountsService.verifyPassword).toHaveBeenCalledWith(
        "user-1",
        "Password1!",
      );
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith("user-1");
    });

    it("rejects an invalid password", async () => {
      mockAccountsService.getAccountByUserId.mockResolvedValue({
        password: "hash",
      });
      mockAccountsService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.deleteAccount(user, { password: "wrong" }),
      ).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
      expect(mockUsersService.deleteUser).not.toHaveBeenCalled();
    });
  });
});
