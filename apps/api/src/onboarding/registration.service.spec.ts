import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { RegistrationService } from "./registration.service";
import { UsersService } from "src/users/users.service";
import { AccountsService } from "src/accounts/accounts.service";
import { WorkspacesService } from "src/workspaces/workspaces.service";
import { SessionsService } from "src/auth/sessions.service";
import { EmailVerificationService } from "src/auth/email-verification.service";
import { DATABASE_TOKEN } from "src/database/database.constants";

describe("RegistrationService", () => {
  let service: RegistrationService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockAccountsService = {
    createAccount: jest.fn(),
    setPassword: jest.fn(),
  };

  const mockWorkspacesService = {
    createDefaultWorkspaceForUser: jest.fn(),
  };

  const mockSessionsService = {
    createSession: jest.fn(),
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
        RegistrationService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: WorkspacesService, useValue: mockWorkspacesService },
        { provide: SessionsService, useValue: mockSessionsService },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    const signUpDto = {
      email: "new@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      name: "New User",
    };

    it("throws when the email is already registered", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: "existing" });

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockDb.transaction).not.toHaveBeenCalled();
    });

    it("provisions identity, workspace, session, and verification in one transaction", async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(undefined);
      mockUsersService.createUser.mockResolvedValue({
        id: "user-1",
        email: signUpDto.email,
        name: signUpDto.name,
      });
      mockAccountsService.createAccount.mockResolvedValue({});
      mockAccountsService.setPassword.mockResolvedValue({});
      mockWorkspacesService.createDefaultWorkspaceForUser.mockResolvedValue({});
      mockSessionsService.createSession.mockResolvedValue({
        token: "session-token",
      });
      mockEmailVerificationService.requestEmailVerification.mockResolvedValue(
        "verify-token",
      );

      await expect(service.signUp(signUpDto)).resolves.toEqual({
        token: "session-token",
      });

      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        { name: signUpDto.name, email: signUpDto.email },
        mockTx,
      );
      expect(mockAccountsService.createAccount).toHaveBeenCalledWith(
        { userId: "user-1" },
        mockTx,
      );
      expect(mockAccountsService.setPassword).toHaveBeenCalledWith(
        "user-1",
        signUpDto.password,
        mockTx,
      );
      expect(
        mockWorkspacesService.createDefaultWorkspaceForUser,
      ).toHaveBeenCalledWith("user-1", signUpDto.name, mockTx);
      expect(mockSessionsService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1" }),
        mockTx,
      );
      expect(
        mockEmailVerificationService.requestEmailVerification,
      ).toHaveBeenCalledWith("user-1", signUpDto.email, mockTx);
      expect(
        mockEmailVerificationService.dispatchVerificationEmail,
      ).toHaveBeenCalledWith(signUpDto.email, "verify-token");
    });
  });
});
