"use client";

import {
  ASSET_UPLOAD_ALLOWED_MIME_TYPES,
  type OrganizationAssetData,
} from "@repo/shared";
import { Button } from "@repo/ui/client";
import { Crop, FileImage, FolderOpen, ImageUp, Upload } from "lucide-react";
import { useWorkspace } from "@/contexts/workspace-context";
import { useWorkspaceImageUpload } from "@/lib/workspaces/use-workspace-image-upload";
import { useOrganizationAssets } from "@/lib/workspaces/workspace-hooks";
import { FieldRow } from "./fields";
import {
  aspectRatioLabel,
  formatAssetBytes,
  isPlaceholderImageSrc,
  type ImageNaturalSize,
} from "./image-display-width";
import { useOpenImageLibrary } from "./image-library-context";

const ACCEPT = ASSET_UPLOAD_ALLOWED_MIME_TYPES.join(",");

function fileLabelFromSrc(src: string, assets: OrganizationAssetData[]): string | null {
  const match = assets.find((asset) => asset.url === src);
  if (match) {
    return match.name;
  }
  try {
    const last = new URL(src).pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : null;
  } catch {
    return null;
  }
}

function PreviewChips({ size }: { size: ImageNaturalSize | null }) {
  if (!size) {
    return null;
  }

  const ratio = aspectRatioLabel(size.width, size.height);

  return (
    <>
      <span className="absolute bottom-2 left-2 rounded-full bg-text/80 px-2 py-1 text-[11px] font-medium text-text-inverse">
        {size.width} × {size.height}
      </span>
      {ratio ? (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[11px] font-medium text-text-2">
          <Crop className="size-[11px]" strokeWidth={1.5} />
          {ratio}
        </span>
      ) : null}
    </>
  );
}

export function ImageSourceCard({
  value,
  disabled = false,
  showCrop = false,
  naturalSize,
  onPicked,
  onChange,
  onNaturalSize,
}: {
  value: string;
  disabled?: boolean;
  showCrop?: boolean;
  naturalSize?: ImageNaturalSize | null;
  onPicked?: (url: string) => void;
  onChange: (url: string) => void;
  onNaturalSize?: (size: ImageNaturalSize) => void;
}) {
  const { token, inputRef, isUploading, uploadSelectedFile, openFilePicker } =
    useWorkspaceImageUpload();
  const { workspace } = useWorkspace();
  const assetsQuery = useOrganizationAssets(
    workspace.id,
    workspace.organizationId,
  );
  const openLibrary = useOpenImageLibrary();
  const assets = assetsQuery.data ?? [];
  const hasImage = value.length > 0 && !isPlaceholderImageSrc(value);
  const busy = disabled || isUploading;
  const match = assets.find((asset) => asset.url === value);
  const fileLabel = hasImage ? fileLabelFromSrc(value, assets) : null;
  const chips =
    naturalSize && naturalSize.width > 0 ? naturalSize : null;

  function applyUrl(url: string) {
    if (onPicked) {
      onPicked(url);
      return;
    }
    onChange(url);
  }

  function handleFile(file: File | undefined) {
    void uploadSelectedFile(file, applyUrl);
  }

  return (
    <div
      onDragOver={(event) => {
        if (busy) {
          return;
        }
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (busy) {
          return;
        }
        event.preventDefault();
        handleFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {hasImage ? (
        <div className="overflow-hidden rounded-[10px] border border-border">
          <div className="relative flex h-[148px] items-center justify-center bg-surface-sunken">
            <img
              src={value}
              alt=""
              className="max-h-[148px] max-w-full object-contain"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                  onNaturalSize?.({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  });
                }
              }}
            />
            <PreviewChips size={chips} />
          </div>
          <div className="flex h-9 border-t border-border">
            <button
              type="button"
              disabled={busy || !token}
              className="flex flex-1 items-center justify-center gap-1.5 text-xs font-medium text-text transition-colors duration-150 hover:bg-bg disabled:text-text-3"
              onClick={openFilePicker}
            >
              <ImageUp className="size-3.5 text-text-2" strokeWidth={1.5} />
              {isUploading ? "Uploading…" : "Replace"}
            </button>
            {showCrop ? (
              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex flex-1 items-center justify-center gap-1.5 border-x border-border text-xs font-medium text-text-3"
              >
                <Crop className="size-3.5" strokeWidth={1.5} />
                Crop
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              className="flex h-full flex-1 items-center justify-center gap-1.5 text-xs font-medium text-text transition-colors duration-150 hover:bg-bg disabled:text-text-3"
              onClick={openLibrary}
            >
              <FolderOpen className="size-3.5 text-text-2" strokeWidth={1.5} />
              Library
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-[10px] border border-dashed border-border-strong bg-bg px-5 py-6">
          <span className="inline-flex size-[38px] items-center justify-center rounded-full bg-accent-soft text-accent">
            <ImageUp className="size-[18px]" strokeWidth={1.5} />
          </span>
          <div className="space-y-1 text-center">
            <p className="text-[12.5px] font-semibold text-text">
              {isUploading ? "Uploading…" : "Drop an image here"}
            </p>
            <p className="text-[11px] text-text-3">
              PNG, JPG, GIF or WebP · max 2 MB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={busy || !token}
              leftIcon={<Upload className="size-3.5" strokeWidth={1.5} />}
              onClick={openFilePicker}
            >
              Upload
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              leftIcon={<FolderOpen className="size-3.5" strokeWidth={1.5} />}
              onClick={openLibrary}
            >
              Library
            </Button>
          </div>
        </div>
      )}
      {hasImage && fileLabel ? (
        <div className="mt-3 flex items-center gap-2 text-[11.5px]">
          <FileImage className="size-3.5 shrink-0 text-text-3" strokeWidth={1.5} />
          <span className="min-w-0 flex-1 truncate font-medium text-text-2">
            {fileLabel}
          </span>
          {match ? (
            <span className="shrink-0 text-text-3">
              {formatAssetBytes(match.byteSize)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ImageSourceField({
  label,
  value,
  onChange,
  onPicked,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPicked?: (url: string) => void;
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      <ImageSourceCard
        value={value}
        disabled={disabled}
        onChange={onChange}
        onPicked={onPicked}
      />
    </FieldRow>
  );
}
