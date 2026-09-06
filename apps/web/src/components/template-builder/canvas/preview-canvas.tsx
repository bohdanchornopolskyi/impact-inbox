"use client";

import { CanvasSelectionBar } from "./canvas-selection-bar";
import { CanvasSubjectCard } from "./canvas-subject-card";
import { usePreviewCanvasRuntime } from "./use-preview-canvas-runtime";

export function PreviewCanvas() {
  const {
    iframeRef,
    scrollContainerRef,
    iframeSrcDoc,
    handleIframeLoad,
    canvasWidth,
    canEdit,
    previewZoom,
  } = usePreviewCanvasRuntime();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-canvas-bg">
      <CanvasSelectionBar />
      <div
        ref={scrollContainerRef}
        className="flex min-h-0 flex-1 justify-center overflow-auto px-8 pt-4.5 pb-8">
        <div
          className="flex flex-col items-center gap-3"
          style={{ zoom: previewZoom / 100 }}
        >
          <CanvasSubjectCard width={canvasWidth} />
          <div
            className="relative overflow-hidden rounded-md bg-white shadow-card"
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
          </div>
        </div>
      </div>
      {!canEdit ? (
        <p className="shrink-0 border-t border-border px-4 py-2 text-ui-xs text-text-3">
          View-only access
        </p>
      ) : null}
    </div>
  );
}
