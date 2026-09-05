"use client";

import { ChevronRight, File } from "lucide-react";
import { cn } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import { TemplateBlockIcon } from "../block-icons";
import { selectionCrumbs } from "./selection-path";

export function CanvasSelectionBar() {
  const content = useBuilder((s) => s.content);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const crumbs = selectionCrumbs(content, selectedBlockId);
  const width = content.settings.width;

  return (
    <div className="flex h-[42px] shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4">
      <nav aria-label="Selection path" className="flex min-w-0 items-center gap-1">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;
          return (
            <div key={crumb.id ?? "body"} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight
                  className="size-3 shrink-0 text-text-3"
                  strokeWidth={1.5}
                />
              ) : null}
              <button
                type="button"
                aria-current={current ? "location" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.25 rounded-xs px-[7px] py-1 text-xs transition-[background-color,color] duration-150 ease-out",
                  current
                    ? "bg-accent-soft font-semibold text-accent"
                    : "font-medium text-text-2 hover:bg-surface-sunken",
                )}
                onClick={() => {
                  selectBlock(crumb.id);
                  if (crumb.id === null) {
                    setInspectorMode("templateSettings");
                  }
                }}
              >
                {crumb.type === "body" ? (
                  <File className="size-3" strokeWidth={1.5} />
                ) : (
                  <TemplateBlockIcon type={crumb.type} className="size-3" />
                )}
                {crumb.label}
              </button>
            </div>
          );
        })}
      </nav>
      <p className="shrink-0 text-xs tabular-nums text-text-3">
        {width} px content width
      </p>
    </div>
  );
}
