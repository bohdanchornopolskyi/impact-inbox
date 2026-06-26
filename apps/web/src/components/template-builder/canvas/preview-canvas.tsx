"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import { findBlock, getBlockLabel } from "@repo/shared";
import {
  previewWidth,
  useRenderedPreview,
} from "@/lib/templates/use-rendered-preview";
import { useBuilder } from "../builder-provider";
import {
  buildCanvasBridgeDocument,
  isBlockSelectMessage,
} from "./canvas-bridge";

export function PreviewCanvas() {
  const content = useBuilder((s) => s.content);
  const canEdit = useBuilder((s) => s.canEdit);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const selectBlock = useBuilder((s) => s.selectBlock);
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
    return found ? getBlockLabel(found.block) : null;
  }, [content, selectedBlockId]);

  const srcDoc = useMemo(
    () => (html ? buildCanvasBridgeDocument(html, { canEdit }) : ""),
    [html, canEdit],
  );

  const postSelectBlock = useCallback(
    (blockId: string | null, label: string | null) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "select-block", blockId, label },
        "*",
      );
    },
    [],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (!isBlockSelectMessage(event.data)) {
        return;
      }

      selectBlock(event.data.blockId);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [selectBlock]);

  useEffect(() => {
    postSelectBlock(selectedBlockId, selectedLabel);
  }, [selectedBlockId, selectedLabel, srcDoc, postSelectBlock]);

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
          <iframe
            ref={iframeRef}
            title="Template preview"
            className="block w-full border-0"
            style={{ minHeight: 640 }}
            srcDoc={srcDoc}
            onLoad={() => postSelectBlock(selectedBlockId, selectedLabel)}
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
