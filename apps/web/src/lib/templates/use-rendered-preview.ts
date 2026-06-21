"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TemplateContentData, TemplateSettings } from "@repo/shared";

export type PreviewDevice = "desktop" | "mobile";
import { useSession } from "@/contexts/session-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { previewTemplateContent } from "@/lib/api/templates-api";

const PREVIEW_DEBOUNCE_MS = 300;
const MOBILE_PREVIEW_WIDTH = 375;
const DEFAULT_PREVIEW_WIDTH = 600;

/**
 * The device only affects the visible canvas/iframe width; the rendered HTML is
 * identical regardless of device, so the shared query is not keyed on it.
 */
export function previewWidth(
  device: PreviewDevice,
  settings: TemplateContentData["settings"] | TemplateSettings,
): number {
  if (device === "mobile") {
    return MOBILE_PREVIEW_WIDTH;
  }

  return settings.width ?? DEFAULT_PREVIEW_WIDTH;
}

/**
 * Shared rendered-preview query. Both the inline canvas and the full-screen
 * overlay consume this hook so they share the react-query cache and only one
 * fetch happens per content change. Keyed on a debounced content hash to avoid
 * a request on every keystroke.
 */
export function useRenderedPreview(
  content: TemplateContentData,
  enabled = true,
) {
  const { token } = useSession();
  const { workspace } = useWorkspace();

  const contentHash = JSON.stringify(content);
  const [debouncedHash, setDebouncedHash] = useState(contentHash);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedHash(contentHash);
    }, PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [contentHash]);

  const query = useQuery({
    queryKey: ["rendered-preview", workspace.id, debouncedHash, token],
    queryFn: () =>
      previewTemplateContent(token, workspace.id, {
        content: JSON.parse(debouncedHash) as TemplateContentData,
      }),
    enabled: Boolean(token) && enabled,
  });

  return { html: query.data?.html ?? "", isFetching: query.isFetching };
}
