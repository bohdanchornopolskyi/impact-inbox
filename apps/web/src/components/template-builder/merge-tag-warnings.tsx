"use client";

import { useMemo } from "react";
import {
  buildKnownMergeTagNames,
  findUnknownMergeTagsInContent,
  formatMergeTag,
} from "@repo/shared";
import { useContactAttributeKeys } from "@/lib/contacts/contact-hooks";
import { useBuilder } from "./builder-provider";

export function MergeTagWarnings() {
  const content = useBuilder((s) => s.content);
  const attributeKeysQuery = useContactAttributeKeys();

  const unknownTags = useMemo(() => {
    const knownTags = buildKnownMergeTagNames(
      attributeKeysQuery.data?.keys ?? [],
    );
    return findUnknownMergeTagsInContent(content, knownTags);
  }, [attributeKeysQuery.data?.keys, content]);

  if (unknownTags.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-status-warning-bg bg-status-warning-bg px-4 py-2">
      <p className="text-ui-sm text-status-warning-fg">
        Unknown merge{" "}
        {unknownTags.length === 1 ? "tag" : "tags"}:{" "}
        {unknownTags.map((tag) => formatMergeTag(tag)).join(", ")}.
      </p>
    </div>
  );
}
