import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DEFAULT_TEMPLATE_CONTENT } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { TemplateRevisionsService } from "./template-revisions.service";
import { TemplatesService } from "./templates.service";

describe("TemplateRevisionsService", () => {
  let service: TemplateRevisionsService;

  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockTransaction = jest.fn();
  const mockUpdate = jest.fn();

  const mockTemplatesService = {
    getTemplate: jest.fn(),
    updateTemplate: jest.fn(),
  };

  const mockDb = {
    insert: mockInsert,
    select: mockSelect,
    transaction: mockTransaction,
    update: mockUpdate,
  };

  const templateData = {
    id: "tpl-1",
    workspaceId: "ws-1",
    name: "Welcome",
    content: DEFAULT_TEMPLATE_CONTENT,
    archivedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const revisionRow = {
    id: "rev-1",
    templateId: "tpl-1",
    content: DEFAULT_TEMPLATE_CONTENT,
    createdAt: new Date("2024-06-01"),
  };

  // Builds a `tx` object whose guarded UPDATE returns `updateRows` and whose
  // revision INSERT returns `insertRows`, then runs the transaction callback.
  function setupTransaction(
    updateRows: unknown[] = [templateData],
    insertRows: unknown[] = [revisionRow],
  ) {
    const txSet = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue(updateRows),
      }),
    });
    const txInsertValues = jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(insertRows),
    });
    const tx = {
      update: jest.fn().mockReturnValue({ set: txSet }),
      insert: jest.fn().mockReturnValue({ values: txInsertValues }),
    };
    mockTransaction.mockImplementation(
      async (cb: (tx: unknown) => unknown) => cb(tx),
    );
    return { tx, txSet, txInsertValues };
  }

  beforeEach(async () => {
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockResolvedValue([]);
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([revisionRow]),
      }),
    });
    setupTransaction();
    mockTemplatesService.getTemplate.mockResolvedValue(templateData);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateRevisionsService,
        { provide: DATABASE_TOKEN, useValue: mockDb },
        { provide: TemplatesService, useValue: mockTemplatesService },
      ],
    }).compile();

    service = module.get<TemplateRevisionsService>(TemplateRevisionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("persists the working copy and snapshots a revision atomically", async () => {
    const { tx, txSet, txInsertValues } = setupTransaction();

    const input = {
      content: DEFAULT_TEMPLATE_CONTENT,
      expectedUpdatedAt: templateData.updatedAt.toISOString(),
    };

    const revision = await service.saveRevision("ws-1", "tpl-1", input);

    expect(revision.id).toBe("rev-1");
    // Single transaction: template UPDATE then revision INSERT.
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(tx.update).toHaveBeenCalled();
    expect(tx.insert).toHaveBeenCalled();

    // Working copy from the client is written and bumps updatedAt.
    const setArg = txSet.mock.calls[0][0];
    expect(setArg.content).toEqual(DEFAULT_TEMPLATE_CONTENT);
    expect(setArg.updatedAt).toBeInstanceOf(Date);

    // The same content is snapshotted into the revision.
    expect(txInsertValues).toHaveBeenCalledWith({
      templateId: "tpl-1",
      content: DEFAULT_TEMPLATE_CONTENT,
    });
  });

  it("throws 409 on save when the updatedAt token is stale", async () => {
    // Guarded UPDATE matches zero rows.
    setupTransaction([], [revisionRow]);

    await expect(
      service.saveRevision("ws-1", "tpl-1", {
        content: DEFAULT_TEMPLATE_CONTENT,
        expectedUpdatedAt: new Date("2020-01-01").toISOString(),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("lists revisions for a template", async () => {
    mockWhere.mockImplementation(() => ({
      orderBy: mockOrderBy,
    }));
    mockOrderBy.mockResolvedValueOnce([
      {
        id: "rev-1",
        templateId: "tpl-1",
        content: DEFAULT_TEMPLATE_CONTENT,
        createdAt: new Date("2024-06-01"),
      },
    ]);

    const revisions = await service.listRevisions("ws-1", "tpl-1");

    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.id).toBe("rev-1");
  });

  it("throws when restoring a missing revision", async () => {
    mockWhere.mockResolvedValueOnce([]);

    await expect(
      service.restoreRevision(
        "ws-1",
        "tpl-1",
        "missing",
        templateData.updatedAt.toISOString(),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("restores guarding on the updatedAt token", async () => {
    mockWhere.mockResolvedValueOnce([revisionRow]);
    const { txSet } = setupTransaction([templateData]);

    const result = await service.restoreRevision(
      "ws-1",
      "tpl-1",
      "rev-1",
      templateData.updatedAt.toISOString(),
    );

    expect(result.id).toBe("tpl-1");
    const setArg = txSet.mock.calls[0][0];
    expect(setArg.content).toEqual(revisionRow.content);
    expect(setArg.updatedAt).toBeInstanceOf(Date);
  });

  it("throws 409 on restore when the updatedAt token is stale", async () => {
    mockWhere.mockResolvedValueOnce([revisionRow]);
    // Guarded UPDATE matches zero rows.
    setupTransaction([]);

    await expect(
      service.restoreRevision(
        "ws-1",
        "tpl-1",
        "rev-1",
        new Date("2020-01-01").toISOString(),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
