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

  it("gets a template by id", async () => {
    const template = { id: "tpl-1", name: "Welcome" };
    mockTemplatesService.getTemplate.mockResolvedValue(template);

    await expect(controller.getById("ws-1", "tpl-1")).resolves.toEqual(template);
    expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
    );
  });

  it("updates a template", async () => {
    const dto = { name: "Updated" };
    const updated = { id: "tpl-1", ...dto };
    mockTemplatesService.updateTemplate.mockResolvedValue(updated);

    await expect(controller.update("ws-1", "tpl-1", dto)).resolves.toEqual(
      updated,
    );
    expect(mockTemplatesService.updateTemplate).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
      dto,
    );
  });

  it("deletes a template", async () => {
    mockTemplatesService.deleteTemplate.mockResolvedValue(undefined);

    await expect(controller.delete("ws-1", "tpl-1")).resolves.toEqual({
      success: true,
    });
    expect(mockTemplatesService.deleteTemplate).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
    );
  });

  it("previews stored template content", async () => {
    const preview = { html: "<html></html>", text: "Hello" };
    mockTemplatesService.previewTemplate.mockResolvedValue(preview);

    await expect(controller.preview("ws-1", "tpl-1")).resolves.toEqual(preview);
    expect(mockTemplatesService.previewTemplate).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
    );
  });

  it("previews arbitrary content", async () => {
    const content = { version: 1 as const, settings: { width: 600 }, body: [] };
    const preview = { html: "<html></html>", text: "" };
    mockTemplatesService.previewContent.mockResolvedValue(preview);

    await expect(controller.previewContent({ content })).resolves.toEqual(
      preview,
    );
    expect(mockTemplatesService.previewContent).toHaveBeenCalledWith(content);
  });
});
