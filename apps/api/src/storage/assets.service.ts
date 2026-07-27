import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  organizationAssets,
  templateRevisions,
  templates,
  workspaceModules,
  workspaces,
  type Database,
  type OrganizationAssetsSelect,
} from "@repo/db";
import {
  ASSET_UPLOAD_MAX_BYTES,
  ASSET_UPLOAD_MIME_EXTENSIONS,
  isAssetUploadMimeType,
  sectionUsesAssetUrl,
  stripAssetUrlFromContent,
  stripAssetUrlFromSection,
  templateContentUsesAssetUrl,
  type AuthenticatedWorkspaceContext,
  type OrganizationAssetData,
  type OrganizationAssetUsageData,
  type SectionBlock,
  type UpdateOrganizationAssetInput,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import {
  buildAssetObjectKey,
  contentTypeFromAssetExtension,
  organizationAssetsPrefix,
  parseAssetObjectKey,
} from "src/storage/object-key";
import {
  OBJECT_STORAGE_TOKEN,
  type ObjectStorage,
} from "src/storage/object-storage";

type UploadFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname?: string;
};

@Injectable()
export class AssetsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    @Inject(OBJECT_STORAGE_TOKEN)
    private readonly objectStorage: ObjectStorage,
  ) {}

  async listAssets(
    context: AuthenticatedWorkspaceContext,
  ): Promise<OrganizationAssetData[]> {
    await this.syncOrganizationAssetsFromStorage(context);

    const rows = await this.db
      .select()
      .from(organizationAssets)
      .where(
        eq(
          organizationAssets.organizationId,
          context.workspace.organizationId,
        ),
      )
      .orderBy(desc(organizationAssets.createdAt));

    return rows.map((row) => this.toAssetData(row));
  }

  private async syncOrganizationAssetsFromStorage(
    context: AuthenticatedWorkspaceContext,
  ): Promise<void> {
    const organizationId = context.workspace.organizationId;
    const remoteObjects = await this.objectStorage.listObjects(
      organizationAssetsPrefix(organizationId),
    );

    if (remoteObjects.length === 0) {
      return;
    }

    const existing = await this.db
      .select({
        id: organizationAssets.id,
        storageKey: organizationAssets.storageKey,
      })
      .from(organizationAssets)
      .where(eq(organizationAssets.organizationId, organizationId));

    const knownKeys = new Set(existing.map((row) => row.storageKey));
    const knownIds = new Set(existing.map((row) => row.id));

    for (const object of remoteObjects) {
      if (knownKeys.has(object.key)) {
        continue;
      }

      const parsed = parseAssetObjectKey(object.key);
      if (!parsed || parsed.organizationId !== organizationId) {
        continue;
      }

      if (knownIds.has(parsed.assetId)) {
        continue;
      }

      try {
        await this.db
          .insert(organizationAssets)
          .values({
            id: parsed.assetId,
            organizationId: parsed.organizationId,
            workspaceId: parsed.workspaceId,
            name: `image.${parsed.extension}`,
            storageKey: object.key,
            url: object.publicUrl,
            contentType: contentTypeFromAssetExtension(parsed.extension),
            byteSize: object.size,
          })
          .onConflictDoNothing({ target: organizationAssets.id });

        knownKeys.add(object.key);
        knownIds.add(parsed.assetId);
      } catch {
        // Skip objects whose workspace/org no longer exist.
      }
    }
  }

  async uploadImage(
    context: AuthenticatedWorkspaceContext,
    userId: string,
    file: UploadFile | undefined,
  ): Promise<OrganizationAssetData> {
    if (!file?.buffer?.length) {
      throw new BadRequestException("Image file is required");
    }

    if (file.size > ASSET_UPLOAD_MAX_BYTES) {
      throw new BadRequestException("Image file is too large");
    }

    if (!isAssetUploadMimeType(file.mimetype)) {
      throw new BadRequestException(
        "Unsupported image type. Use JPEG, PNG, GIF, or WebP.",
      );
    }

    const extension = ASSET_UPLOAD_MIME_EXTENSIONS[file.mimetype];
    const assetId = globalThis.crypto.randomUUID();
    const key = buildAssetObjectKey({
      organizationId: context.workspace.organizationId,
      workspaceId: context.workspace.id,
      assetId,
      extension,
    });

    const stored = await this.objectStorage.putObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const name = this.displayNameFromFile(file.originalname, extension);

    const [created] = await this.db
      .insert(organizationAssets)
      .values({
        id: assetId,
        organizationId: context.workspace.organizationId,
        workspaceId: context.workspace.id,
        createdByUserId: userId,
        name,
        storageKey: stored.key,
        url: stored.publicUrl,
        contentType: file.mimetype,
        byteSize: file.size,
      })
      .returning();

    if (!created) {
      throw new BadRequestException("Could not save asset metadata");
    }

    return this.toAssetData(created);
  }

  async updateAsset(
    context: AuthenticatedWorkspaceContext,
    assetId: string,
    input: UpdateOrganizationAssetInput,
  ): Promise<OrganizationAssetData> {
    const existing = await this.findOrgAsset(
      context.workspace.organizationId,
      assetId,
    );

    const [updated] = await this.db
      .update(organizationAssets)
      .set({ name: input.name.trim() })
      .where(
        and(
          eq(organizationAssets.id, existing.id),
          eq(
            organizationAssets.organizationId,
            context.workspace.organizationId,
          ),
        ),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException("Asset not found");
    }

    return this.toAssetData(updated);
  }

  async getAssetUsage(
    context: AuthenticatedWorkspaceContext,
    assetId: string,
  ): Promise<OrganizationAssetUsageData> {
    const existing = await this.findOrgAsset(
      context.workspace.organizationId,
      assetId,
    );
    return this.findAssetUsage(
      context.workspace.organizationId,
      existing.url,
    );
  }

  async deleteAsset(
    context: AuthenticatedWorkspaceContext,
    assetId: string,
  ): Promise<void> {
    const existing = await this.findOrgAsset(
      context.workspace.organizationId,
      assetId,
    );

    await this.detachAssetUrl(context.workspace.organizationId, existing.url);
    await this.objectStorage.deleteObject(existing.storageKey);

    const deleted = await this.db
      .delete(organizationAssets)
      .where(
        and(
          eq(organizationAssets.id, existing.id),
          eq(
            organizationAssets.organizationId,
            context.workspace.organizationId,
          ),
        ),
      )
      .returning({ id: organizationAssets.id });

    if (deleted.length === 0) {
      throw new NotFoundException("Asset not found");
    }
  }

  private async detachAssetUrl(
    organizationId: string,
    url: string,
  ): Promise<void> {
    const orgWorkspaces = await this.db
      .select({
        id: workspaces.id,
        brandKit: workspaces.brandKit,
      })
      .from(workspaces)
      .where(eq(workspaces.organizationId, organizationId));

    const workspaceIds = orgWorkspaces.map((workspace) => workspace.id);
    if (workspaceIds.length === 0) {
      return;
    }

    for (const workspace of orgWorkspaces) {
      if (workspace.brandKit?.logoUrl !== url) {
        continue;
      }
      await this.db
        .update(workspaces)
        .set({
          brandKit: {
            ...workspace.brandKit,
            logoUrl: "",
          },
        })
        .where(eq(workspaces.id, workspace.id));
    }

    const templateRows = await this.db
      .select({
        id: templates.id,
        content: templates.content,
      })
      .from(templates)
      .where(inArray(templates.workspaceId, workspaceIds));

    for (const template of templateRows) {
      if (!templateContentUsesAssetUrl(template.content, url)) {
        continue;
      }
      await this.db
        .update(templates)
        .set({ content: stripAssetUrlFromContent(template.content, url) })
        .where(eq(templates.id, template.id));
    }

    if (templateRows.length > 0) {
      const revisionRows = await this.db
        .select({
          id: templateRevisions.id,
          content: templateRevisions.content,
        })
        .from(templateRevisions)
        .where(
          inArray(
            templateRevisions.templateId,
            templateRows.map((template) => template.id),
          ),
        );

      for (const revision of revisionRows) {
        if (!templateContentUsesAssetUrl(revision.content, url)) {
          continue;
        }
        await this.db
          .update(templateRevisions)
          .set({ content: stripAssetUrlFromContent(revision.content, url) })
          .where(eq(templateRevisions.id, revision.id));
      }
    }

    const moduleRows = await this.db
      .select({
        id: workspaceModules.id,
        content: workspaceModules.content,
      })
      .from(workspaceModules)
      .where(inArray(workspaceModules.workspaceId, workspaceIds));

    for (const module of moduleRows) {
      if (!sectionUsesAssetUrl(module.content as SectionBlock, url)) {
        continue;
      }
      await this.db
        .update(workspaceModules)
        .set({
          content: stripAssetUrlFromSection(
            module.content as SectionBlock,
            url,
          ),
        })
        .where(eq(workspaceModules.id, module.id));
    }
  }

  private async findAssetUsage(
    organizationId: string,
    url: string,
  ): Promise<OrganizationAssetUsageData> {
    const orgWorkspaces = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        brandKit: workspaces.brandKit,
      })
      .from(workspaces)
      .where(eq(workspaces.organizationId, organizationId));

    const workspaceIds = orgWorkspaces.map((workspace) => workspace.id);
    const brandKitWorkspaces = orgWorkspaces
      .filter((workspace) => workspace.brandKit?.logoUrl === url)
      .map((workspace) => workspace.name);

    if (workspaceIds.length === 0) {
      return {
        inUse: brandKitWorkspaces.length > 0,
        templateNames: [],
        revisionCount: 0,
        moduleNames: [],
        brandKitWorkspaces,
      };
    }

    const templateRows = await this.db
      .select({
        id: templates.id,
        name: templates.name,
        content: templates.content,
      })
      .from(templates)
      .where(inArray(templates.workspaceId, workspaceIds));

    const templateNames = templateRows
      .filter((template) =>
        templateContentUsesAssetUrl(template.content, url),
      )
      .map((template) => template.name);

    let revisionCount = 0;
    if (templateRows.length > 0) {
      const revisionRows = await this.db
        .select({
          content: templateRevisions.content,
        })
        .from(templateRevisions)
        .where(
          inArray(
            templateRevisions.templateId,
            templateRows.map((template) => template.id),
          ),
        );

      revisionCount = revisionRows.filter((revision) =>
        templateContentUsesAssetUrl(revision.content, url),
      ).length;
    }

    const moduleRows = await this.db
      .select({
        name: workspaceModules.name,
        content: workspaceModules.content,
      })
      .from(workspaceModules)
      .where(inArray(workspaceModules.workspaceId, workspaceIds));

    const moduleNames = moduleRows
      .filter((module) =>
        sectionUsesAssetUrl(module.content as SectionBlock, url),
      )
      .map((module) => module.name);

    const inUse =
      templateNames.length > 0 ||
      revisionCount > 0 ||
      moduleNames.length > 0 ||
      brandKitWorkspaces.length > 0;

    return {
      inUse,
      templateNames,
      revisionCount,
      moduleNames,
      brandKitWorkspaces,
    };
  }

  private async findOrgAsset(
    organizationId: string,
    assetId: string,
  ): Promise<OrganizationAssetsSelect> {
    const [asset] = await this.db
      .select()
      .from(organizationAssets)
      .where(
        and(
          eq(organizationAssets.id, assetId),
          eq(organizationAssets.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    return asset;
  }

  private displayNameFromFile(
    originalname: string | undefined,
    extension: string,
  ): string {
    const raw = originalname?.trim();
    if (!raw) {
      return `image.${extension}`;
    }
    const base = raw.split(/[/\\]/).pop() ?? raw;
    return base.slice(0, 255) || `image.${extension}`;
  }

  private toAssetData(row: OrganizationAssetsSelect): OrganizationAssetData {
    return {
      id: row.id,
      organizationId: row.organizationId,
      workspaceId: row.workspaceId,
      name: row.name,
      url: row.url,
      contentType: row.contentType,
      byteSize: row.byteSize,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
