"use client";

import { useState } from "react";
import {
  ALL_MERGE_TAGS,
  CONTACT_MERGE_TAGS,
  RESERVED_MERGE_TAGS,
  formatMergeTag,
} from "@repo/shared";
import { BasePopover, MergeTagPopover } from "@repo/ui/client";
import { useToast } from "@/components/ui/toast";

const MERGE_TAG_GROUPS = [
  { label: "Contact", tags: CONTACT_MERGE_TAGS },
  { label: "Organization", tags: RESERVED_MERGE_TAGS },
];

type TagDraft = {
  tag: string;
  fallback: string;
};

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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TagDraft | null>(null);
  const selected = ALL_MERGE_TAGS.find((entry) => entry.tag === draft?.tag);

  function close() {
    setOpen(false);
    setDraft(null);
  }

  async function commit(tag: string, fallback: string) {
    const formatted = formatMergeTag(tag, fallback);

    if (onInsert) {
      onInsert(formatted);
      close();
      return;
    }

    try {
      await navigator.clipboard.writeText(formatted);
      showToast(`Copied ${formatted}`);
      close();
    } catch {
      showError("Could not copy merge tag");
    }
  }

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setDraft(null);
        }
      }}
    >
      <BasePopover.Trigger className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-text-2 transition-[background-color,border-color] duration-150 ease-out hover:border-border-strong hover:bg-surface-sunken">
        <span className="text-ui-sm">Merge tags</span>
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner align="start" sideOffset={6}>
          <BasePopover.Popup className="z-50 max-h-72 overflow-y-auto rounded-md border border-border bg-surface p-1.5 shadow-[0_8px_24px_#0f172a1f] outline-none">
            {draft && selected ? (
              <MergeTagPopover
                label={selected.label}
                fallback={draft.fallback}
                onFallbackChange={(fallback) =>
                  setDraft({ tag: draft.tag, fallback })
                }
                onChangeField={() => setDraft(null)}
                onRemove={close}
                onDone={() => void commit(draft.tag, draft.fallback)}
              />
            ) : (
              <div className="flex w-[280px] flex-col gap-1">
                {MERGE_TAG_GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-col gap-0.5">
                    <p className="px-2 pt-1.5 font-sans text-[10.5px] font-semibold tracking-[0.8px] text-text-3 uppercase">
                      {group.label}
                    </p>
                    {group.tags.map((entry) => (
                      <button
                        key={entry.tag}
                        type="button"
                        onClick={() =>
                          setDraft({ tag: entry.tag, fallback: "" })
                        }
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
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
