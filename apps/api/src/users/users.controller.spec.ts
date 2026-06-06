import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthService } from "src/auth/auth.service";
import { AuthTokensService } from "src/auth/auth-tokens.service";
import { EmailService } from "src/email/email.service";

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: AuthTokensService, useValue: {} },
        { provide: EmailService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe("getMe", () => {
    it("returns the authenticated user profile", () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        emailVerifiedAt: null,
      };

      expect(controller.getMe(user)).toEqual(user);
    });
  });
});
