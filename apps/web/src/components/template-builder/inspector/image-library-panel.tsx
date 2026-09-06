"use client";

import { useState } from "react";
import { Check, ChevronLeft, Search, Upload } from "lucide-react";
import {
  ASSET_UPLOAD_ALLOWED_MIME_TYPES,
  type OrganizationAssetData,
} from "@repo/shared";
import { Button, Input, cn } from "@repo/ui/client";
import { useWorkspace } from "@/contexts/workspace-context";
import { useWorkspaceImageUpload } from "@/lib/workspaces/use-workspace-image-upload";
import { useOrganizationAssets } from "@/lib/workspaces/workspace-hooks";
import {
  formatLibraryTileMeta,
  type ImageNaturalSize,
} from "./image-display-width";

const ACCEPT = ASSET_UPLOAD_ALLOWED_MIME_TYPES.join(",");

export function ImageLibraryPanel({
  currentSrc,
  canEdit,
  onBack,
  onPick,
}: {
  currentSrc: string;
  canEdit: boolean;
  onBack: () => void;
  onPick: (url: string) => void;
}) {
  const { workspace } = useWorkspace();
  const { token, inputRef, isUploading, uploadSelectedFile, openFilePicker } =
    useWorkspaceImageUpload();
  const assetsQuery = useOrganizationAssets(
    workspace.id,
    workspace.organizationId,
  );
  const [query, setQuery] = useState("");
  const assets = assetsQuery.data ?? [];
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? assets.filter((asset) => asset.name.toLowerCase().includes(needle))
    : assets;
  const busy = !canEdit || isUploading;

  function handleFile(file: File | undefined) {
    void uploadSelectedFile(file, (url) => {
      onPick(url);
    });
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onBack();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={busy || !token}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-3.5 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            icon
            size="md"
            aria-label="Back"
            onClick={onBack}
          >
            <ChevronLeft strokeWidth={1.5} />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-md font-semibold text-text">
              Choose an image
            </p>
            <p className="text-xs text-text-3">
              {assets.length === 1 ? "1 image" : `${assets.length} images`}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={busy || !token}
          leftIcon={<Upload className="size-3.5" strokeWidth={1.5} />}
          onClick={openFilePicker}
        >
          {isUploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <div className="shrink-0 px-4 pt-3 pb-2">
        <Input
          type="search"
          autoFocus
          placeholder="Search images"
          value={query}
          aria-label="Search images"
          leadingIcon={<Search className="size-3.5" strokeWidth={1.5} />}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-4">
        {visible.length === 0 ? (
          <p className="px-1 py-8 text-center text-xs text-text-3">
            {assets.length === 0
              ? "No uploads yet. Use Upload to add one."
              : "No matching images."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((asset) => (
              <LibraryTile
                key={asset.id}
                asset={asset}
                current={asset.url === currentSrc}
                disabled={busy}
                onSelect={onPick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryTile({
  asset,
  current,
  disabled,
  onSelect,
}: {
  asset: OrganizationAssetData;
  current: boolean;
  disabled: boolean;
  onSelect: (url: string) => void;
}) {
  const [natural, setNatural] = useState<ImageNaturalSize | null>(null);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? "true" : undefined}
      aria-label={current ? `${asset.name}, current image` : `Use ${asset.name}`}
      className="flex min-w-0 flex-col gap-1.5 text-left outline-none focus-visible:shadow-(--shadow-ring-accent) disabled:opacity-60"
      onClick={() => onSelect(asset.url)}
    >
      <span
        className={cn(
          "relative block h-[118px] overflow-hidden rounded-sm bg-surface-sunken",
          current && "ring-2 ring-accent",
        )}
      >
        <img
          src={asset.url}
          alt=""
          className="size-full object-cover"
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image.naturalWidth > 0 && image.naturalHeight > 0) {
              setNatural({
                width: image.naturalWidth,
                height: image.naturalHeight,
              });
            }
          }}
        />
        {current ? (
          <span className="absolute right-2 bottom-2 inline-flex size-[22px] items-center justify-center rounded-full bg-accent">
            <Check className="size-3 text-text-inverse" strokeWidth={2.5} />
          </span>
        ) : null}
      </span>
      <span className="min-w-0 truncate text-xs font-medium text-text">
        {asset.name}
      </span>
      <span className="text-[11px] text-text-3">
        {formatLibraryTileMeta(
          natural?.width ?? null,
          natural?.height ?? null,
          asset.byteSize,
        )}
      </span>
    </button>
  );
}
