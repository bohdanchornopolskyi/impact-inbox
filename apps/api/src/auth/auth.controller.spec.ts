import { Test } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { CredentialService } from "./credential.service";
import { SessionsService } from "./sessions.service";
import { RegistrationService } from "src/onboarding/registration.service";
import { EmailVerificationService } from "./email-verification.service";
import { UsersService } from "src/users/users.service";

describe("AuthController", () => {
  let controller: AuthController;
  let registrationService: RegistrationService;

  const mockCredentialService = {
    signIn: jest.fn(),
    signOut: jest.fn(),
  };

  const mockRegistrationService = {
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CredentialService, useValue: mockCredentialService },
        { provide: SessionsService, useValue: {} },
        { provide: RegistrationService, useValue: mockRegistrationService },
        { provide: EmailVerificationService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    controller = module.get(AuthController);
    registrationService = module.get(RegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    it("should return a token", async () => {
      const dto = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Test User",
      };

      mockRegistrationService.signUp.mockResolvedValue({ token: "jwt-token" });

      const result = await controller.signUp(dto);

      expect(registrationService.signUp).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ token: "jwt-token" });
    });
  });
});
