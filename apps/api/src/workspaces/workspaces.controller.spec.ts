import { Test, TestingModule } from "@nestjs/testing";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { WorkspaceGuard } from "./guards/workspace.guard";

describe("WorkspacesController", () => {
  let controller: WorkspacesController;

  const mockWorkspacesService = {
    createWorkspace: jest.fn(),
    listWorkspacesForUser: jest.fn(),
    getWorkspaceForUser: jest.fn(),
    updateWorkspace: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        { provide: WorkspacesService, useValue: mockWorkspacesService },
      ],
    })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("lists workspaces for the current user", async () => {
    const user = { id: "user-1", email: "test@example.com", name: "Test" };
    const workspaces = [{ id: "ws-1", name: "Test Workspace", role: "owner" }];
    mockWorkspacesService.listWorkspacesForUser.mockResolvedValue(workspaces);

    await expect(controller.list(user)).resolves.toEqual(workspaces);
    expect(mockWorkspacesService.listWorkspacesForUser).toHaveBeenCalledWith(
      "user-1",
    );
  });
});
