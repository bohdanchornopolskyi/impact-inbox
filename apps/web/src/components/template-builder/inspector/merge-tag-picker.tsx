"use client";

import { CONTACT_MERGE_TAGS, RESERVED_MERGE_TAGS, formatMergeTag } from "@repo/shared";
import { Popover } from "@repo/ui/client";
import { useToast } from "@/components/ui/toast";

const MERGE_TAG_GROUPS = [
  { label: "Contact", tags: CONTACT_MERGE_TAGS },
  { label: "Organization", tags: RESERVED_MERGE_TAGS },
];

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
      <div className="flex flex-col gap-1">
        {MERGE_TAG_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p className="px-2 pt-1.5 font-sans text-[10.5px] font-semibold tracking-[0.8px] text-text-3 uppercase">
              {group.label}
            </p>
            {group.tags.map((entry) => (
              <button
                key={entry.tag}
                type="button"
                onClick={() => void selectTag(entry.tag)}
                className="flex w-full items-center justify-between gap-3 rounded-xs px-2 py-1.5 text-left hover:bg-surface-sunken"
              >
                <span className="text-sm text-text">{entry.label}</span>
                <span className="font-mono text-2xs text-text-3">
                  {formatMergeTag(entry.tag)}
                </span>
              </button>
            ))}
          </div>
        ))}
        <p className="border-t border-border px-2 pt-2 text-xs text-text-2">
          Fields without a fallback send blank.
        </p>
      </div>
    </Popover>
  );
}
