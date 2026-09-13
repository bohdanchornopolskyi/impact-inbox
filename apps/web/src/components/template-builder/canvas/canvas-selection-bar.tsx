"use client";

import { Fragment } from "react";
import { ChevronRight, File } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "@repo/ui/client";
import { useBuilder, useBuilderStore } from "../builder-provider";
import { TemplateBlockIcon } from "../block-icons";
import { selectionCrumbs, selectionPathKey } from "./selection-path";

export function CanvasSelectionBar() {
  const store = useBuilderStore();
  const pathKey = useBuilder((s) =>
    selectionPathKey(s.content, s.selectedBlockId),
  );
  const width = useBuilder((s) => s.content.settings.width);
  const crumbs = pathKey
    ? selectionCrumbs(
        store.getState().content,
        store.getState().selectedBlockId,
      )
    : [];

  return (
    <div className="flex h-[42px] shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4">
      <Breadcrumb aria-label="Selection path" className="min-w-0">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;

          return (
            <Fragment key={crumb.id ?? "body"}>
              {index > 0 ? (
                <li className="flex items-center" aria-hidden>
                  <ChevronRight
                    className="size-3 shrink-0 text-text-3"
                    strokeWidth={1.5}
                  />
                </li>
              ) : null}
              <BreadcrumbItem
                current={current}
                icon={
                  crumb.type === "body" ? (
                    <File strokeWidth={1.5} />
                  ) : (
                    <TemplateBlockIcon type={crumb.type} />
                  )
                }
                onClick={() => {
                  const state = store.getState();
                  state.selectBlock(crumb.id);
                  if (crumb.id === null) {
                    state.setInspectorMode("templateSettings");
                  }
                }}
              >
                {crumb.label}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </Breadcrumb>
      <p className="shrink-0 text-xs tabular-nums text-text-3">
        {width} px content width
      </p>
    </div>
  );
}
