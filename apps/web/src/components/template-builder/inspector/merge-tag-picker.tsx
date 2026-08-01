"use client";

import { ALL_MERGE_TAGS, formatMergeTag } from "@repo/shared";
import { Popover } from "@repo/ui/client";
import { useToast } from "@/components/ui/toast";

/**
 * Merge-tag list. With `onInsert` the tag is written into the caller's field;
 * without it the tag is copied so it can be pasted into block content.
 */
export function MergeTagPicker({
  onInsert,
}: {
  onInsert?: (formattedTag: string) => void;
}) {
  const { showToast, showError } = useToast();

  async function selectTag(tag: string) {
    const formatted = formatMergeTag(tag);

    if (onInsert) {
      onInsert(formatted);
      return;
    }

    try {
      await navigator.clipboard.writeText(formatted);
      showToast(`Copied ${formatted}`);
    } catch {
      showError("Could not copy merge tag");
    }
  }

  return (
    <Popover
      trigger={<span className="text-ui-sm">Merge tags</span>}
      className="max-h-72 overflow-y-auto"
    >
      <div className="space-y-1">
        {ALL_MERGE_TAGS.map((entry) => (
          <button
            key={entry.tag}
            type="button"
            onClick={() => void selectTag(entry.tag)}
            className="flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-surface-muted"
          >
            <span className="font-mono text-ui-xs text-accent-text">
              {formatMergeTag(entry.tag)}
            </span>
            <span className="text-ui-xs text-text-tertiary">{entry.label}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
