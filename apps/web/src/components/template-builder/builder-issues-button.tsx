"use client";

import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";
import {
  buildKnownMergeTagNames,
  findUnknownMergeTagsInContent,
  formatMergeTag,
} from "@repo/shared";
import { Popover } from "@repo/ui/client";
import { useContactAttributeKeys } from "@/lib/contacts/contact-hooks";
import { useBuilder } from "./builder-provider";

export function BuilderIssuesButton() {
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
    <Popover
      align="end"
      className="w-72 p-3"
      triggerClassName="h-control-md gap-1.5 border-warning-500/40 bg-warning-50 px-3 font-medium text-warning-700 hover:border-warning-500/60 hover:bg-warning-50"
      trigger={
        <>
          <TriangleAlert className="size-3.75" strokeWidth={1.5} aria-hidden />
          {unknownTags.length} {unknownTags.length === 1 ? "issue" : "issues"}
        </>
      }
    >
      <p className="text-xs font-semibold text-text">Unknown merge tags</p>
      <p className="mt-1 text-xs text-text-2">
        These tags don&apos;t match any contact field.
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {unknownTags.map((tag) => (
          <li key={tag} className="font-mono text-xs text-warning-700">
            {formatMergeTag(tag)}
          </li>
        ))}
      </ul>
    </Popover>
  );
}
