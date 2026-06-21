"use client";

import { useMemo, useRef } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import { findBlock } from "@repo/shared";
import {
  previewWidth,
  useRenderedPreview,
} from "@/lib/templates/use-rendered-preview";
import { useBuilder } from "../builder-provider";

export function PreviewCanvas() {
  const content = useBuilder((s) => s.content);
  const canEdit = useBuilder((s) => s.canEdit);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const previewDevice = useBuilder((s) => s.previewDevice);
  const setPreviewDevice = useBuilder((s) => s.setPreviewDevice);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { html } = useRenderedPreview(content);

  const canvasWidth = previewWidth(previewDevice, content.settings);

  const selectedLabel = useMemo(() => {
    if (!selectedBlockId) {
      return null;
    }

    const found = findBlock(content, selectedBlockId);
    return found?.block.type ?? null;
  }, [content, selectedBlockId]);

  return (
    <div className="flex h-full flex-col bg-surface-sunken">
      <div className="flex items-center justify-between border-b border-border-default bg-surface-card px-4 py-2">
        <p className="text-ui-sm text-text-secondary">Canvas preview</p>
        <SegmentedControl
          value={previewDevice}
          onChange={(value) =>
            setPreviewDevice(value as "desktop" | "mobile")
          }
          options={[
            {
              value: "desktop",
              label: "Desktop",
              icon: <Monitor className="size-4" strokeWidth={1.5} />,
            },
            {
              value: "mobile",
              label: "Mobile",
              icon: <Smartphone className="size-4" strokeWidth={1.5} />,
            },
          ]}
        />
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div
          className="relative bg-white shadow-card"
          style={{ width: canvasWidth }}
        >
          {selectedLabel && selectedBlockId ? (
            <div className="pointer-events-none absolute -top-7 left-0 rounded bg-accent px-2 py-0.5 text-ui-xs font-medium text-text-on-accent">
              {selectedLabel}
            </div>
          ) : null}
          <iframe
            ref={iframeRef}
            title="Template preview"
            className="block w-full border-0"
            style={{ minHeight: 640 }}
            srcDoc={html}
          />
        </div>
      </div>
      {!canEdit ? (
        <p className="border-t border-border-subtle px-4 py-2 text-ui-xs text-text-tertiary">
          View-only access
        </p>
      ) : null}
    </div>
  );
}
