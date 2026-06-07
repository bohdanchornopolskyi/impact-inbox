import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UserLifecycleService } from "src/users/user-lifecycle.service";

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UserLifecycleService, useValue: {} }],
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
