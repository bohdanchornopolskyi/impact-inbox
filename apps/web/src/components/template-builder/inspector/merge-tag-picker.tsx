"use client";

import { ALL_MERGE_TAGS, formatMergeTag } from "@repo/shared";
import { Popover } from "@repo/ui/client";
import { useToast } from "@/components/ui/toast";

export function MergeTagPicker() {
  const { showToast, showError } = useToast();

  async function copyTag(tag: string) {
    try {
      await navigator.clipboard.writeText(formatMergeTag(tag));
      showToast(`Copied ${formatMergeTag(tag)}`);
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
            onClick={() => void copyTag(entry.tag)}
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
