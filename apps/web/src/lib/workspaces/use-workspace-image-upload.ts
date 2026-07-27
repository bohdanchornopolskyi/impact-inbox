"use client";

import { useRef, useState } from "react";
import { ASSET_UPLOAD_MAX_BYTES } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { uploadWorkspaceAsset } from "@/lib/api/assets-api";
import { organizationAssetsQueryKey } from "@/lib/workspaces/workspace-hooks";
import { showError } from "@/stores/toast-store";

export function useWorkspaceImageUpload() {
  const { token } = useSession();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadSelectedFile(
    file: File | undefined,
    onUploaded: (url: string) => void,
  ) {
    if (!file || !token) {
      return;
    }
    if (file.size > ASSET_UPLOAD_MAX_BYTES) {
      showError("Image must be 2MB or smaller");
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await uploadWorkspaceAsset(token, workspace.id, file);
      onUploaded(uploaded.url);
      void queryClient.invalidateQueries({
        queryKey: organizationAssetsQueryKey(
          workspace.id,
          workspace.organizationId,
        ),
      });
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Could not upload image",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return {
    token,
    inputRef,
    isUploading,
    uploadSelectedFile,
    openFilePicker: () => inputRef.current?.click(),
  };
}
