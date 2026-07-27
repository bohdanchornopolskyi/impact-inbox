"use client";

import { ASSET_UPLOAD_ALLOWED_MIME_TYPES } from "@repo/shared";
import { Button, Input } from "@repo/ui/client";
import { useWorkspaceImageUpload } from "@/lib/workspaces/use-workspace-image-upload";
import { FieldRow } from "./fields";

const ACCEPT = ASSET_UPLOAD_ALLOWED_MIME_TYPES.join(",");

export function ImageSourceField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { token, inputRef, isUploading, uploadSelectedFile, openFilePicker } =
    useWorkspaceImageUpload();

  return (
    <FieldRow label={label}>
      <div className="space-y-2">
        <Input
          value={value}
          placeholder="https://"
          mono
          disabled={disabled || isUploading}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(event) => {
              void uploadSelectedFile(event.target.files?.[0], onChange);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || isUploading || !token}
            onClick={openFilePicker}
          >
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
          <span className="text-ui-xs text-text-tertiary">
            JPEG, PNG, GIF, WebP · max 2MB
          </span>
        </div>
      </div>
    </FieldRow>
  );
}
