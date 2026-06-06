import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { AuthService } from "./auth.service";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { INVALID_CREDENTIALS_MESSAGE } from "@repo/shared";

jest.mock("argon2");

describe("AuthService", () => {
  let service: AuthService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockAccountsService = {
    findAccountByUserId: jest.fn(),
  };

  const mockDb = {
    insert: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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
      mockUsersService.findUserByEmail.mockResolvedValue({ id: "user-1" });
      mockAccountsService.findAccountByUserId.mockResolvedValue({
        password: "hash",
      });
      jest.mocked(argon2.verify).mockResolvedValue(true);
      jest.spyOn(service, "createSession").mockResolvedValue({
        token: "session-token",
      } as never);

      await expect(service.signIn(credentials)).resolves.toEqual({
        token: "session-token",
      });
    });

    it("throws the same unauthorized error when the user does not exist", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(undefined);

      await expect(service.signIn(credentials)).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
      expect(mockAccountsService.findAccountByUserId).not.toHaveBeenCalled();
    });

    it("throws the same unauthorized error when the account is missing", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: "user-1" });
      mockAccountsService.findAccountByUserId.mockResolvedValue(undefined);

      await expect(service.signIn(credentials)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(service.signIn(credentials)).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
    });

    it("throws the same unauthorized error when the password is wrong", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: "user-1" });
      mockAccountsService.findAccountByUserId.mockResolvedValue({
        password: "hash",
      });
      jest.mocked(argon2.verify).mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toMatchObject({
        response: { message: INVALID_CREDENTIALS_MESSAGE, statusCode: 401 },
      });
    });
  });
});
