import { Test, TestingModule } from "@nestjs/testing";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";

describe("TemplatesController", () => {
  let controller: TemplatesController;

  const mockTemplatesService = {
    listTemplates: jest.fn(),
    createTemplate: jest.fn(),
    getTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    previewTemplate: jest.fn(),
    previewContent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        { provide: TemplatesService, useValue: mockTemplatesService },
      ],
    })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TemplatesController>(TemplatesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("lists templates for a workspace", async () => {
    const templates = [{ id: "tpl-1", name: "Welcome" }];
    mockTemplatesService.listTemplates.mockResolvedValue(templates);

    await expect(controller.list("ws-1", {})).resolves.toEqual(templates);
    expect(mockTemplatesService.listTemplates).toHaveBeenCalledWith("ws-1", {});
  });

  it("creates a template", async () => {
    const dto = { name: "Welcome" };
    const created = { id: "tpl-1", ...dto };
    mockTemplatesService.createTemplate.mockResolvedValue(created);

    await expect(controller.create("ws-1", dto)).resolves.toEqual(created);
    expect(mockTemplatesService.createTemplate).toHaveBeenCalledWith(
      "ws-1",
      dto,
    );
  });
});
