"use client";

import { useRef, useState } from "react";
import { MoreHorizontal, Upload } from "lucide-react";
import {
  ASSET_UPLOAD_ALLOWED_MIME_TYPES,
  hasWorkspaceRoleAtLeast,
  templateContentUsesAssetUrl,
  type OrganizationAssetData,
  type OrganizationAssetUsageData,
} from "@repo/shared";
import { Button, BasePopover, DropdownMenu, Input, cn } from "@repo/ui/client";
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
import { useBuilder, useSelectedBlock } from "./builder-provider";
import { ConfirmModal } from "./modals/confirm-modal";

const ACCEPT = ASSET_UPLOAD_ALLOWED_MIME_TYPES.join(",");

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

export function AssetsPanel() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const updateBlockProps = useBuilder((s) => s.updateBlockProps);
  const stripAssetUrl = useBuilder((s) => s.stripAssetUrl);
  const selectedBlock = useSelectedBlock();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRename, setPendingRename] =
    useState<OrganizationAssetData | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [pendingDelete, setPendingDelete] =
    useState<OrganizationAssetData | null>(null);
  const [deleteUsage, setDeleteUsage] =
    useState<OrganizationAssetUsageData | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
  const canApplyToBlock =
    canEdit &&
    selectedBlock &&
    (selectedBlock.block.type === "image" ||
      selectedBlock.block.type === "logo");

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
    if (!canApplyToBlock || !selectedBlock) {
      showError("Select an image or logo block first");
      return;
    }
    updateBlockProps(selectedBlock.block.id, { src: asset.url });
    showToast("Applied to selected block");
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
        content,
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
      stripAssetUrl(url);
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border-subtle px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-ui-sm font-semibold text-text-primary">Assets</h2>
          <p className="mt-0.5 text-ui-xs text-text-tertiary">
            {canApplyToBlock
              ? "Click an image to place it on the selected block"
              : "Click to copy URL · select an image block to place"}
          </p>
        </div>
        {canManage ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={upload.isPending}
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={upload.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5" strokeWidth={1.5} />
              {upload.isPending ? "…" : "Upload"}
            </Button>
          </>
        ) : null}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-3 transition-colors",
          isDragging && "bg-accent-soft/40",
        )}
        onDragEnter={(event) => {
          if (!canManage) {
            return;
          }
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          if (!canManage) {
            return;
          }
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          if (!canManage) {
            return;
          }
          event.preventDefault();
          setIsDragging(false);
          handleUpload(event.dataTransfer.files?.[0]);
        }}
      >
        {assetsQuery.isLoading ? (
          <p className="text-ui-xs text-text-tertiary">Loading assets…</p>
        ) : null}
        {assetsQuery.error ? (
          <p className="text-ui-xs text-danger">Could not load assets.</p>
        ) : null}

        {!assetsQuery.isLoading && assets.length === 0 ? (
          <button
            type="button"
            disabled={!canManage || upload.isPending}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-10 text-center",
              canManage
                ? "hover:border-accent-border hover:bg-surface-muted"
                : "cursor-default opacity-70",
            )}
          >
            <Upload className="size-5 text-text-tertiary" strokeWidth={1.5} />
            <span className="text-ui-sm font-medium text-text-primary">
              {canManage ? "Drop an image here" : "No assets yet"}
            </span>
            <span className="text-ui-xs text-text-tertiary">
              JPEG, PNG, GIF, WebP · max 2MB
            </span>
          </button>
        ) : null}

        {assets.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2">
            {assets.map((asset) => {
              const isRenaming = pendingRename?.id === asset.id;
              const menuItems = [
                {
                  label: "Use on selected block",
                  disabled: !canApplyToBlock,
                  onSelect: () => applyToSelectedBlock(asset),
                },
                {
                  label: "Copy URL",
                  onSelect: () => copyUrl(asset),
                },
                ...(canManage
                  ? [
                      {
                        label: "Rename",
                        onSelect: () => startRename(asset),
                      },
                      {
                        label: "Delete",
                        destructive: true,
                        onSelect: () => {
                          void requestDelete(asset);
                        },
                      },
                    ]
                  : []),
              ];

              return (
                <li key={asset.id} className="group relative min-w-0">
                  <BasePopover.Root
                    open={isRenaming}
                    onOpenChange={(open, details) => {
                      if (open) {
                        details.cancel();
                        return;
                      }
                      setPendingRename(null);
                    }}
                  >
                    <div
                      className={cn(
                        "overflow-hidden rounded-lg border border-border-default bg-surface-muted transition-colors",
                        "hover:border-accent-border focus-within:border-accent-border",
                        isRenaming && "border-accent-border",
                      )}
                    >
                      <button
                        type="button"
                        className="relative block aspect-square w-full overflow-hidden bg-surface-inset outline-none"
                        onClick={() => onPrimaryClick(asset)}
                        aria-label={
                          canApplyToBlock
                            ? `Use ${asset.name}`
                            : `Copy URL for ${asset.name}`
                        }
                      >
                        <img
                          src={asset.url}
                          alt=""
                          className="size-full object-cover"
                        />
                      </button>

                      <div className="flex items-center gap-0.5 border-t border-border-subtle px-1.5 py-1">
                        <BasePopover.Trigger
                          render={
                            <button
                              type="button"
                              className="min-w-0 flex-1 truncate px-1 text-left text-ui-xs font-medium text-text-primary"
                              title={asset.name}
                              onClick={() => onPrimaryClick(asset)}
                              onDoubleClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                startRename(asset);
                              }}
                            >
                              {asset.name}
                            </button>
                          }
                        />

                        <DropdownMenu
                          align="end"
                          className="size-7 shrink-0 opacity-70 group-hover:opacity-100 group-focus-within:opacity-100"
                          trigger={
                            <MoreHorizontal
                              className="size-3.5"
                              strokeWidth={1.5}
                            />
                          }
                          items={menuItems}
                        />
                      </div>
                    </div>

                    <BasePopover.Portal>
                      <BasePopover.Positioner
                        align="start"
                        side="bottom"
                        sideOffset={6}
                      >
                        <BasePopover.Popup className="z-50 w-64 rounded-xl border border-border-default bg-surface-card p-3 shadow-pop outline-none">
                          <Input
                            label="Name"
                            autoFocus
                            value={renameDraft}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) =>
                              setRenameDraft(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void confirmRename();
                              }
                            }}
                          />
                          <div className="mt-3 flex justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-8 px-2.5 text-ui-xs"
                              onClick={() => setPendingRename(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              className="h-8 px-2.5 text-ui-xs text-text-on-accent"
                              disabled={
                                !renameDraft.trim() || update.isPending
                              }
                              onClick={() => void confirmRename()}
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
            })}
          </ul>
        ) : null}

        {canManage && assets.length > 0 ? (
          <p className="mt-3 text-center text-ui-xs text-text-tertiary">
            Drop files anywhere to upload · double-click name to rename
          </p>
        ) : null}
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteUsage(null);
          }
        }}
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
        isPending={remove.isPending || isCheckingUsage}
        confirmDisabled={isCheckingUsage}
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
