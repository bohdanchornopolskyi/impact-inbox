"use client";

import { useEffect, useRef, useState } from "react";

const PREVIEW_WIDTH = 600;
const PREVIEW_HEIGHT = 480;

function TemplateThumbnailPlaceholder() {
  return (
    <div
      className="relative h-36 overflow-hidden rounded-lg border border-border-default bg-surface-sunken"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, #ececee 0, #ececee 1px, transparent 1px, transparent 10px)",
      }}
    >
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-2xs text-text-muted">
          No saved preview
        </span>
      </div>
    </div>
  );
}

export function TemplateThumbnail({
  listPreviewHtml,
}: {
  listPreviewHtml: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    function updateScale() {
      const width = element?.clientWidth ?? PREVIEW_WIDTH;
      setScale(width / PREVIEW_WIDTH);
    }

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  if (!listPreviewHtml) {
    return <TemplateThumbnailPlaceholder />;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-36 overflow-hidden rounded-lg border border-border-default bg-white"
    >
      <iframe
        title="Template preview"
        srcDoc={listPreviewHtml}
        sandbox=""
        className="pointer-events-none absolute top-0 left-0 border-0 bg-white"
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
