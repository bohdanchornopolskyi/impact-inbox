"use client";

import { useEffect } from "react";
import { Eye, Monitor, Smartphone } from "lucide-react";
import { ClosePanelButton, SegmentedControl } from "@repo/ui/client";
import {
  previewWidth,
  useRenderedPreview,
} from "@/lib/templates/use-rendered-preview";
import { useBuilder } from "./builder-provider";

export function PreviewOverlay() {
  const content = useBuilder((s) => s.content);
  const previewOpen = useBuilder((s) => s.previewOpen);
  const previewDevice = useBuilder((s) => s.previewDevice);
  const setPreviewOpen = useBuilder((s) => s.setPreviewOpen);
  const setPreviewDevice = useBuilder((s) => s.setPreviewDevice);
  const { html } = useRenderedPreview(content, previewOpen);

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPreviewOpen, previewOpen]);

  if (!previewOpen) {
    return null;
  }

  const width = previewWidth(previewDevice, content.settings);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/90">
      <div className="flex h-12 items-center justify-between bg-neutral-900 px-4 text-white">
        <p className="inline-flex items-center gap-2 text-ui-sm font-medium">
          <Eye className="size-4" strokeWidth={1.5} />
          Preview
        </p>
        <div className="flex items-center gap-3">
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
          <ClosePanelButton onClick={() => setPreviewOpen(false)} />
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <iframe
          title="Full preview"
          className="bg-white shadow-card"
          style={{ width, minHeight: 720 }}
          srcDoc={html}
        />
      </div>
    </div>
  );
}
