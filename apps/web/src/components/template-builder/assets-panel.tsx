"use client";

import { useRef, useState, type RefObject } from "react";
import { MoreHorizontal, MousePointerClick, Upload } from "lucide-react";
import {
  ASSET_UPLOAD_ALLOWED_MIME_TYPES,
  findBlock,
  hasWorkspaceRoleAtLeast,
  templateContentUsesAssetUrl,
  type OrganizationAssetData,
  type OrganizationAssetUsageData,
} from "@repo/shared";
import {
  BasePopover,
  Button,
  DropdownMenu,
  EditorPanelHint,
  EditorPanelScroll,
  Input,
  LibraryTile,
  Search,
} from "@repo/ui/client";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { getOrganizationAssetUsage } from "@/lib/api/assets-api";
import {
  useDeleteOrganizationAsset,
  useOrganizationAssets,
  useUpdateOrganizationAsset,
  useUploadOrganizationAsset,
} from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { showError, showToast } from "@/stores/toast-store";
import { useBuilder, useBuilderStore } from "./builder-provider";
import { canApplyAssetToSelection } from "./asset-apply-target";
import { filterEditorPanel } from "./filter-editor-panel";
import { widthForPickedImage } from "./inspector/image-display-width";
import { ConfirmModal } from "./modals/confirm-modal";

const ACCEPT = ASSET_UPLOAD_ALLOWED_MIME_TYPES.join(",");

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAssetUsageMessage(usage: OrganizationAssetUsageData): string {
  const parts: string[] = [];
  if (usage.templateNames.length > 0) {
    parts.push(
      `templates (${usage.templateNames.slice(0, 3).join(", ")}${
        usage.templateNames.length > 3 ? "…" : ""
      })`,
    );
  }
  if (usage.revisionCount > 0) {
    parts.push(
      `${usage.revisionCount} saved revision${usage.revisionCount === 1 ? "" : "s"}`,
    );
  }
  if (usage.moduleNames.length > 0) {
    parts.push(
      `modules (${usage.moduleNames.slice(0, 3).join(", ")}${
        usage.moduleNames.length > 3 ? "…" : ""
      })`,
    );
  }
  if (usage.brandKitWorkspaces.length > 0) {
    parts.push("brand kit logo");
  }
  if (parts.length === 0) {
    return "This image is still in use.";
  }
  return `Used in ${parts.join(", ")}.`;
}

function AssetsPanelHeader({
  canManage,
  isUploading,
  fileInputRef,
  onUpload,
}: {
  canManage: boolean;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (file: File | undefined) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 px-3 pb-1 pt-3">
      <div className="min-w-0 flex-1">
        <Search
          fieldClassName="border-transparent bg-bg"
          placeholder="Search assets"
          aria-label="Search assets"
          onInput={(event) => {
            const root = event.currentTarget.closest("[data-panel]");
            if (root instanceof HTMLElement) {
              filterEditorPanel(root, event.currentTarget.value);
            }
          }}
        />
      </div>
      {canManage ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon
            className="shrink-0"
            disabled={isUploading}
            aria-label={isUploading ? "Uploading" : "Upload image"}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload strokeWidth={1.5} />
          </Button>
        </>
      ) : null}
    </div>
  );
}

function AssetsEmptyState({
  canManage,
  isUploading,
  onUploadClick,
}: {
  canManage: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!canManage || isUploading}
      onClick={onUploadClick}
      className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-8 text-center disabled:cursor-default disabled:opacity-70"
    >
      <Upload className="size-4 text-text-3" strokeWidth={1.5} />
      <span className="text-xs font-medium text-text">
        {canManage ? "Drop an image here" : "No assets yet"}
      </span>
      <span className="text-2xs text-text-3">JPEG, PNG, GIF, WebP · max 2MB</span>
    </button>
  );
}

function AssetCard({
  asset,
  isRenaming,
  renameDraft,
  canManage,
  canApplyToBlock,
  isUpdatePending,
  onPrimaryClick,
  onApply,
  onCopyUrl,
  onStartRename,
  onRenameDraftChange,
  onConfirmRename,
  onCancelRename,
  onRequestDelete,
}: {
  asset: OrganizationAssetData;
  isRenaming: boolean;
  renameDraft: string;
  canManage: boolean;
  canApplyToBlock: boolean;
  isUpdatePending: boolean;
  onPrimaryClick: (asset: OrganizationAssetData) => void;
  onApply: (asset: OrganizationAssetData) => void;
  onCopyUrl: (asset: OrganizationAssetData) => void;
  onStartRename: (asset: OrganizationAssetData) => void;
  onRenameDraftChange: (value: string) => void;
  onConfirmRename: () => void;
  onCancelRename: () => void;
  onRequestDelete: (asset: OrganizationAssetData) => void;
}) {
  const menuItems = [
    {
      label: "Use on selected block",
      disabled: !canApplyToBlock,
      onSelect: () => onApply(asset),
    },
    {
      label: "Copy URL",
      onSelect: () => onCopyUrl(asset),
    },
    ...(canManage
      ? [
          {
            label: "Rename",
            onSelect: () => onStartRename(asset),
          },
          {
            label: "Delete",
            destructive: true,
            separatorBefore: true,
            onSelect: () => {
              void onRequestDelete(asset);
            },
          },
        ]
      : []),
  ];

  return (
    <li className="group relative min-w-0" data-filter={asset.name.toLowerCase()}>
      <BasePopover.Root
        open={isRenaming}
        onOpenChange={(open, details) => {
          if (open) {
            details.cancel();
            return;
          }
          onCancelRename();
        }}
      >
        <div className="relative">
          <BasePopover.Trigger
            render={
              <button type="button" className="sr-only">
                Rename {asset.name}
              </button>
            }
          />
          <LibraryTile
            filename={asset.name}
            meta={formatBytes(asset.byteSize)}
            src={asset.url}
            onClick={() => onPrimaryClick(asset)}
            aria-label={
              canApplyToBlock
                ? `Use ${asset.name}`
                : `Copy URL for ${asset.name}`
            }
          />
          <div className="absolute top-1.5 right-1.5">
            <DropdownMenu
              align="end"
              aria-label={`Actions for ${asset.name}`}
              className="size-7 bg-surface/90 opacity-0 shadow-xs group-hover:opacity-100 group-focus-within:opacity-100"
              trigger={<MoreHorizontal className="size-3.5" strokeWidth={1.5} />}
              items={menuItems}
            />
          </div>
        </div>

        <BasePopover.Portal>
          <BasePopover.Positioner align="start" side="bottom" sideOffset={6}>
            <BasePopover.Popup className="z-50 w-64 rounded-md border border-border bg-surface p-3 shadow-md outline-none">
              <Input
                label="Name"
                autoFocus
                value={renameDraft}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => onRenameDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void onConfirmRename();
                  }
                }}
              />
              <div className="mt-3 flex justify-end gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onCancelRename}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!renameDraft.trim() || isUpdatePending}
                  onClick={() => void onConfirmRename()}
                >
                  Save
                </Button>
              </div>
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    </li>
  );
}

function AssetDeleteConfirm({
  pendingDelete,
  deleteUsage,
  isCheckingUsage,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  pendingDelete: OrganizationAssetData | null;
  deleteUsage: OrganizationAssetUsageData | null;
  isCheckingUsage: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      open={pendingDelete !== null}
      onOpenChange={onOpenChange}
      title="Delete asset?"
      description={
        isCheckingUsage
          ? "Checking where this image is used…"
          : deleteUsage?.inUse
            ? `${formatAssetUsageMessage(deleteUsage)} Deleting replaces it with a placeholder in those places, then removes it from the library.`
            : pendingDelete
              ? `Remove “${pendingDelete.name}” from the organization library and storage.`
              : undefined
      }
      confirmLabel="Delete"
      variant="danger"
      isPending={isPending || isCheckingUsage}
      confirmDisabled={isCheckingUsage}
      cancelLabel="Cancel"
      onConfirm={onConfirm}
    />
  );
}

export function AssetsPanel() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const store = useBuilderStore();
  const canApplyToBlock = useBuilder((s) =>
    canApplyAssetToSelection(s.content, s.selectedBlockId, s.canEdit),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRename, setPendingRename] =
    useState<OrganizationAssetData | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [pendingDelete, setPendingDelete] =
    useState<OrganizationAssetData | null>(null);
  const [deleteUsage, setDeleteUsage] =
    useState<OrganizationAssetUsageData | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);

  const assetsQuery = useOrganizationAssets(
    workspace.id,
    workspace.organizationId,
  );
  const uploadMutation = useUploadOrganizationAsset(
    workspace.id,
    workspace.organizationId,
  );
  const updateMutation = useUpdateOrganizationAsset(
    workspace.id,
    workspace.organizationId,
  );
  const deleteMutation = useDeleteOrganizationAsset(
    workspace.id,
    workspace.organizationId,
  );

  const upload = useToastMutation({
    mutationFn: (file: File) => uploadMutation.mutateAsync(file),
    successMessage: "Asset uploaded",
    errorMessage: "Could not upload asset",
  });
  const update = useToastMutation({
    mutationFn: (input: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      updateMutation.mutateAsync(input),
    successMessage: "Asset renamed",
    errorMessage: "Could not rename asset",
  });
  const remove = useToastMutation({
    mutationFn: (assetId: string) => deleteMutation.mutateAsync(assetId),
    successMessage: "Asset deleted",
    errorMessage: "Could not delete asset",
  });

  const assets = assetsQuery.data ?? [];

  function handleUpload(file: File | undefined) {
    if (!file || !canManage) {
      return;
    }
    upload.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  }

  function applyToSelectedBlock(asset: OrganizationAssetData) {
    const { content, selectedBlockId, canEdit, updateBlockProps } =
      store.getState();
    if (!canApplyAssetToSelection(content, selectedBlockId, canEdit)) {
      showError("Select an image or logo block first");
      return;
    }

    const found = selectedBlockId
      ? findBlock(content, selectedBlockId)
      : undefined;
    if (
      !found ||
      (found.block.type !== "image" && found.block.type !== "logo")
    ) {
      return;
    }

    const blockType = found.block.type;
    void widthForPickedImage(
      asset.url,
      blockType,
      content.settings.width,
    ).then((width) => {
      updateBlockProps(found.block.id, { src: asset.url, width });
      showToast("Applied to selected block");
    });
  }

  function copyUrl(asset: OrganizationAssetData) {
    void navigator.clipboard.writeText(asset.url).then(
      () => showToast("URL copied"),
      () => showError("Could not copy URL"),
    );
  }

  function startRename(asset: OrganizationAssetData) {
    if (!canManage) {
      return;
    }
    setPendingRename(asset);
    setRenameDraft(asset.name);
  }

  async function confirmRename() {
    if (!pendingRename) {
      return;
    }
    const nextName = renameDraft.trim();
    if (!canManage || !nextName || nextName === pendingRename.name) {
      setPendingRename(null);
      return;
    }
    try {
      await update.mutateAsync({
        assetId: pendingRename.id,
        input: { name: nextName },
      });
      setPendingRename(null);
    } catch {
      // Toast handled by useToastMutation
    }
  }

  async function requestDelete(asset: OrganizationAssetData) {
    if (!token) {
      return;
    }
    setPendingDelete(asset);
    setDeleteUsage(null);
    setIsCheckingUsage(true);
    try {
      const usage = await getOrganizationAssetUsage(
        token,
        workspace.id,
        asset.id,
      );
      const usedInOpenTemplate = templateContentUsesAssetUrl(
        store.getState().content,
        asset.url,
      );
      setDeleteUsage({
        ...usage,
        inUse: usage.inUse || usedInOpenTemplate,
        templateNames:
          usedInOpenTemplate &&
          !usage.templateNames.includes("This open template")
            ? ["This open template", ...usage.templateNames]
            : usage.templateNames,
      });
    } catch (error) {
      setPendingDelete(null);
      showError(
        error instanceof Error ? error.message : "Could not check asset usage",
      );
    } finally {
      setIsCheckingUsage(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    const url = pendingDelete.url;
    try {
      await remove.mutateAsync(pendingDelete.id);
      store.getState().stripAssetUrl(url);
      setPendingDelete(null);
      setDeleteUsage(null);
    } catch {
      // Toast handled by useToastMutation
    }
  }

  function onPrimaryClick(asset: OrganizationAssetData) {
    if (canApplyToBlock) {
      applyToSelectedBlock(asset);
      return;
    }
    copyUrl(asset);
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden data-[drag]:bg-accent-soft/40"
      data-panel
      onDragEnter={(event) => {
        if (!canManage) {
          return;
        }
        event.preventDefault();
        event.currentTarget.dataset.drag = "";
      }}
      onDragOver={(event) => {
        if (!canManage) {
          return;
        }
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) {
          delete event.currentTarget.dataset.drag;
        }
      }}
      onDrop={(event) => {
        if (!canManage) {
          return;
        }
        event.preventDefault();
        delete event.currentTarget.dataset.drag;
        handleUpload(event.dataTransfer.files?.[0]);
      }}
    >
      <AssetsPanelHeader
        canManage={canManage}
        isUploading={upload.isPending}
        fileInputRef={fileInputRef}
        onUpload={handleUpload}
      />
      <EditorPanelHint>
        <MousePointerClick className="mt-px size-3.25 shrink-0" strokeWidth={1.5} />
        {canApplyToBlock
          ? "Click an image to place it on the selected block"
          : "Select an image block to place, or click to copy the URL"}
      </EditorPanelHint>
      <EditorPanelScroll>
        {assetsQuery.isLoading ? (
          <p className="text-xs text-text-3">Loading assets…</p>
        ) : null}
        {assetsQuery.error ? (
          <p className="text-xs text-danger">Could not load assets.</p>
        ) : null}

        {!assetsQuery.isLoading && assets.length === 0 ? (
          <AssetsEmptyState
            canManage={canManage}
            isUploading={upload.isPending}
            onUploadClick={() => fileInputRef.current?.click()}
          />
        ) : null}

        <p data-filter-empty hidden className="text-xs text-text-3">
          No assets match your search.
        </p>

        {assets.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isRenaming={pendingRename?.id === asset.id}
                renameDraft={renameDraft}
                canManage={canManage}
                canApplyToBlock={Boolean(canApplyToBlock)}
                isUpdatePending={update.isPending}
                onPrimaryClick={onPrimaryClick}
                onApply={applyToSelectedBlock}
                onCopyUrl={copyUrl}
                onStartRename={startRename}
                onRenameDraftChange={setRenameDraft}
                onConfirmRename={confirmRename}
                onCancelRename={() => setPendingRename(null)}
                onRequestDelete={requestDelete}
              />
            ))}
          </ul>
        ) : null}
      </EditorPanelScroll>

      <AssetDeleteConfirm
        pendingDelete={pendingDelete}
        deleteUsage={deleteUsage}
        isCheckingUsage={isCheckingUsage}
        isPending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteUsage(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
