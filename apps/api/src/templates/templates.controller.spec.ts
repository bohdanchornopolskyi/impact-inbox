import { Test, TestingModule } from "@nestjs/testing";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { TemplateRevisionsService } from "./template-revisions.service";
import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";

describe("TemplatesController", () => {
  let controller: TemplatesController;

  const mockTemplatesService = {
    listTemplates: jest.fn(),
    createTemplate: jest.fn(),
    getTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    previewTemplate: jest.fn(),
    previewContent: jest.fn(),
    exportTemplate: jest.fn(),
  };

  const mockTemplateRevisionsService = {
    saveRevision: jest.fn(),
    listRevisions: jest.fn(),
    restoreRevision: jest.fn(),
  };

  const workspaceContext = {
    workspace: {
      id: "ws-1",
      organizationId: "org-1",
      name: "Acme",
      slug: "acme",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    role: "owner" as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        { provide: TemplatesService, useValue: mockTemplatesService },
        {
          provide: TemplateRevisionsService,
          useValue: mockTemplateRevisionsService,
        },
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

  it("exports a template", async () => {
    const exported = {
      html: "<html></html>",
      text: "Hello",
      fileName: "welcome.html",
    };
    mockTemplatesService.exportTemplate.mockResolvedValue(exported);

    await expect(
      controller.exportTemplate("ws-1", "tpl-1", workspaceContext),
    ).resolves.toEqual(exported);

    expect(mockTemplatesService.exportTemplate).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
      "org-1",
    );
  });

  it("saves a revision with the working copy and lock token", async () => {
    const revision = { id: "rev-1" };
    mockTemplateRevisionsService.saveRevision.mockResolvedValue(revision);

    const content = { version: 1 as const, settings: { width: 600 }, body: [] };
    const dto = {
      content,
      expectedUpdatedAt: new Date("2024-01-01").toISOString(),
    };

    await expect(
      controller.saveRevision("ws-1", "tpl-1", dto),
    ).resolves.toEqual(revision);

    expect(mockTemplateRevisionsService.saveRevision).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
      dto,
    );
  });

  it("restores a revision threading the lock token", async () => {
    const restored = { id: "tpl-1" };
    mockTemplateRevisionsService.restoreRevision.mockResolvedValue(restored);

    const expectedUpdatedAt = new Date("2024-01-01").toISOString();

    await expect(
      controller.restoreRevision("ws-1", "tpl-1", "rev-1", {
        expectedUpdatedAt,
      }),
    ).resolves.toEqual(restored);

    expect(mockTemplateRevisionsService.restoreRevision).toHaveBeenCalledWith(
      "ws-1",
      "tpl-1",
      "rev-1",
      expectedUpdatedAt,
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
