import { Test, TestingModule } from "@nestjs/testing";
import * as argon2 from "argon2";
import { AccountsService } from "./accounts.service";
import { DATABASE_TOKEN } from "src/database/database.constants";

jest.mock("argon2");

describe("AccountsService", () => {
  let service: AccountsService;

  const mockReturning = jest.fn();
  const mockWhere = jest.fn(() => ({ returning: mockReturning }));
  const mockSet = jest.fn(() => ({ where: mockWhere }));
  const mockUpdate = jest.fn(() => ({ set: mockSet }));
  const mockFrom = jest.fn(() => ({ where: jest.fn().mockResolvedValue([]) }));
  const mockSelect = jest.fn(() => ({ from: mockFrom }));

  const mockDb = {
    select: mockSelect,
    update: mockUpdate,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyPassword", () => {
    it("returns true when the password matches", async () => {
      jest.spyOn(service, "findAccountByUserId").mockResolvedValue({
        password: "hash",
      } as never);
      jest.mocked(argon2.verify).mockResolvedValue(true);

      await expect(
        service.verifyPassword("user-1", "Password1!"),
      ).resolves.toBe(true);
      expect(argon2.verify).toHaveBeenCalledWith("hash", "Password1!");
    });

    it("returns false when the account has no password", async () => {
      jest.spyOn(service, "findAccountByUserId").mockResolvedValue({
        password: null,
      } as never);

      await expect(
        service.verifyPassword("user-1", "Password1!"),
      ).resolves.toBe(false);
      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it("returns false when verification fails", async () => {
      jest.spyOn(service, "findAccountByUserId").mockResolvedValue({
        password: "hash",
      } as never);
      jest.mocked(argon2.verify).mockResolvedValue(false);

      await expect(
        service.verifyPassword("user-1", "wrong"),
      ).resolves.toBe(false);
    });
  });

  describe("setPassword", () => {
    it("hashes and stores the password", async () => {
      jest.mocked(argon2.hash).mockResolvedValue("new-hash");
      mockReturning.mockResolvedValue([{ userId: "user-1" }]);

      await expect(
        service.setPassword("user-1", "NewPassword1!"),
      ).resolves.toEqual({ userId: "user-1" });

      expect(argon2.hash).toHaveBeenCalledWith("NewPassword1!");
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ password: "new-hash" });
    });
  });
});
