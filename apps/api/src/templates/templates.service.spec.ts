import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { renderTemplate } from "@repo/email-renderer";
import { DEFAULT_TEMPLATE_CONTENT } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { TemplatesService } from "./templates.service";

jest.mock("@repo/email-renderer", () => ({
  renderTemplate: jest.fn(),
}));

describe("TemplatesService", () => {
  let service: TemplatesService;

  const mockSelect = jest.fn();
  const mockFrom = jest.fn();
  const mockWhere = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const mockDb = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  };

  const templateRow = {
    id: "tpl-1",
    workspaceId: "ws-1",
    name: "Welcome",
    content: DEFAULT_TEMPLATE_CONTENT,
    archivedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(async () => {
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue([]);
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([templateRow]),
      }),
    });
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([templateRow]),
        }),
      }),
    });
    mockDelete.mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("previewContent", () => {
    it("renders valid content", async () => {
      const rendered = { html: "<html></html>", text: "Hello" };
      (renderTemplate as jest.Mock).mockResolvedValue(rendered);

      await expect(
        service.previewContent(DEFAULT_TEMPLATE_CONTENT),
      ).resolves.toEqual(rendered);

      expect(renderTemplate).toHaveBeenCalledWith(DEFAULT_TEMPLATE_CONTENT);
    });

    it("rejects invalid content", async () => {
      await expect(
        service.previewContent({ version: 2, settings: {}, body: [] } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("maps render failures to bad request", async () => {
      (renderTemplate as jest.Mock).mockRejectedValue(new Error("render failed"));

      await expect(
        service.previewContent(DEFAULT_TEMPLATE_CONTENT),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("previewTemplate", () => {
    it("loads template and renders validated content", async () => {
      mockWhere.mockResolvedValueOnce([templateRow]);
      const rendered = { html: "<html></html>", text: "" };
      (renderTemplate as jest.Mock).mockResolvedValue(rendered);

      await expect(service.previewTemplate("ws-1", "tpl-1")).resolves.toEqual(
        rendered,
      );
    });

    it("throws when template is missing", async () => {
      mockWhere.mockResolvedValueOnce([]);

      await expect(
        service.previewTemplate("ws-1", "missing"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rejects invalid stored content", async () => {
      mockWhere.mockResolvedValueOnce([
        { ...templateRow, content: { version: 2, body: [] } },
      ]);

      await expect(
        service.previewTemplate("ws-1", "tpl-1"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("createTemplate", () => {
    it("creates with default content", async () => {
      const result = await service.createTemplate("ws-1", { name: "Welcome" });

      expect(result.name).toBe("Welcome");
      expect(result.content).toEqual(DEFAULT_TEMPLATE_CONTENT);
      expect(result.archivedAt).toBeNull();
    });
  });

  describe("listTemplates", () => {
    it("returns active templates by default", async () => {
      mockWhere.mockResolvedValueOnce([templateRow]);

      await service.listTemplates("ws-1", {});

      expect(mockSelect).toHaveBeenCalled();
    });
  });

  describe("updateTemplate", () => {
    it("archives a template", async () => {
      mockWhere.mockResolvedValueOnce([templateRow]);
      const archivedRow = {
        ...templateRow,
        archivedAt: new Date("2024-06-01"),
      };
      mockUpdate.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([archivedRow]),
          }),
        }),
      });

      const result = await service.updateTemplate("ws-1", "tpl-1", {
        archived: true,
      });

      expect(result.archivedAt).toEqual(archivedRow.archivedAt);
    });
  });
});
