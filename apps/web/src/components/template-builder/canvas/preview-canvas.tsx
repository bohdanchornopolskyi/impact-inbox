"use client";

import { useRef, type RefObject } from "react";
import { previewWidth } from "@/lib/templates/use-rendered-preview";
import { useBuilder } from "../builder-provider";
import { CanvasSelectionBar } from "./canvas-selection-bar";
import { CanvasSubjectCard } from "./canvas-subject-card";
import { CanvasAddBlockRow } from "./canvas-add-block-row";
import {
  CanvasIframeSelectionBridge,
  usePreviewCanvasRuntime,
} from "./use-preview-canvas-runtime";

export function PreviewCanvas() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-canvas-bg">
      <CanvasSelectionBar />
      <CanvasViewport />
      <CanvasViewOnlyBanner />
    </div>
  );
}

function CanvasViewport() {
  const previewZoom = useBuilder((s) => s.previewZoom);
  const previewDevice = useBuilder((s) => s.previewDevice);
  const settingsWidth = useBuilder((s) => s.content.settings.width);
  const canvasWidth = previewWidth(previewDevice, { width: settingsWidth });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollContainerRef}
      className="flex min-h-0 flex-1 justify-center overflow-auto px-8 pt-4.5 pb-8"
    >
      <div
        className="flex flex-col items-center gap-3"
        style={{ zoom: previewZoom / 100 }}
      >
        <CanvasSubjectCard width={canvasWidth} />
        <CanvasIframeHost
          scrollContainerRef={scrollContainerRef}
          canvasWidth={canvasWidth}
        />
        <CanvasAddBlockRow width={canvasWidth} />
      </div>
    </div>
  );
}

function CanvasIframeHost({
  scrollContainerRef,
  canvasWidth,
}: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  canvasWidth: number;
}) {
  const { iframeRef, iframeSrcDoc, handleIframeLoad, postToIframe } =
    usePreviewCanvasRuntime(scrollContainerRef);

  return (
    <div
      className="relative overflow-hidden bg-white shadow-card"
      style={{ width: canvasWidth }}
    >
      <iframe
        ref={iframeRef}
        title="Template preview"
        className="block w-full border-0"
        style={{ minHeight: 640 }}
        srcDoc={iframeSrcDoc}
        onLoad={handleIframeLoad}
      />
      <CanvasIframeSelectionBridge postToIframe={postToIframe} />
    </div>
  );
}

function CanvasViewOnlyBanner() {
  const canEdit = useBuilder((s) => s.canEdit);

  if (canEdit) {
    return null;
  }

  return (
    <p className="shrink-0 border-t border-border px-4 py-2 text-ui-xs text-text-3">
      View-only access
    </p>
  );
}
