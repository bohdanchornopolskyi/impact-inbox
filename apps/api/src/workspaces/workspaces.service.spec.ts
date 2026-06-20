import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { OrganizationsService } from "src/organizations/organizations.service";
import { UsersService } from "src/users/users.service";
import { WorkspaceAccessService } from "./workspace-access.service";
import { WorkspacesService } from "./workspaces.service";

describe("WorkspacesService", () => {
  let service: WorkspacesService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
  };

  const mockWorkspaceAccessService = {
    resolve: jest.fn(),
  };

  const mockOrganizationsService = {
    assertCanManageWorkspaces: jest.fn(),
    ensureOrgMember: jest.fn(),
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
        {
          provide: WorkspaceAccessService,
          useValue: mockWorkspaceAccessService,
        },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
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
          id: "member-1",
          workspaceId: "ws-1",
          userId: "owner-1",
          role: "owner" as const,
        },
      ]);

      await expect(
        service.removeMember("ws-1", "owner-1"),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
