import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { UsersService } from "src/users/users.service";
import { WorkspacesService } from "./workspaces.service";

describe("WorkspacesService", () => {
  let service: WorkspacesService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockSelect = jest.fn();
  const mockFrom = jest.fn();
  const mockWhere = jest.fn();
  const mockInnerJoin = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const mockDb = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  };

  beforeEach(async () => {
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({
      where: mockWhere,
      innerJoin: mockInnerJoin,
    });
    mockInnerJoin.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue([]);
    mockInsert.mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }) });
    mockUpdate.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }) }) });
    mockDelete.mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("removeMember", () => {
    it("prevents removing the workspace owner", async () => {
      mockWhere.mockResolvedValueOnce([
        {
          id: "ws-1",
          ownerId: "owner-1",
          name: "Workspace",
          slug: "workspace",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      await expect(
        service.removeMember("ws-1", "owner-1"),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
