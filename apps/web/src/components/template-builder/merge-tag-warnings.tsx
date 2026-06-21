"use client";

import { useMemo } from "react";
import { findUnknownMergeTagsInContent, formatMergeTag } from "@repo/shared";
import { useBuilder } from "./builder-provider";

export function MergeTagWarnings() {
  const content = useBuilder((s) => s.content);

  const unknownTags = useMemo(
    () => findUnknownMergeTagsInContent(content),
    [content],
  );

  if (unknownTags.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-status-warning-bg bg-status-warning-bg px-4 py-2">
      <p className="text-ui-sm text-status-warning-fg">
        Unknown merge{" "}
        {unknownTags.length === 1 ? "tag" : "tags"}:{" "}
        {unknownTags.map((tag) => formatMergeTag(tag)).join(", ")}. Custom
        contact fields are validated after contacts ship.
      </p>
    </div>
  );
}
