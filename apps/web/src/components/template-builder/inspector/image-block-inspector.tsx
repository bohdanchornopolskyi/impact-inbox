"use client";

import { useState } from "react";
import type { ContentBlock } from "@repo/shared";
import { CollapsibleSection, Input, InspectorRow } from "@repo/ui/client";
import { Link } from "lucide-react";
import {
  type ImageNaturalSize,
  widthForPickedImage,
} from "./image-display-width";
import { ImageSizeControls } from "./image-size-controls";
import { ImageSourceCard } from "./image-source-field";

export function ImageBlockInspector({
  block,
  templateWidth,
  canEdit,
  updateProps,
}: {
  block: Extract<ContentBlock, { type: "image" | "logo" }>;
  templateWidth: number;
  canEdit: boolean;
  updateProps: (props: Record<string, unknown>) => void;
}) {
  const src = block.props.src;
  const [measured, setMeasured] = useState<
    (ImageNaturalSize & { src: string }) | null
  >(null);
  const naturalSize = measured?.src === src ? measured : null;

  function pickImage(url: string) {
    void widthForPickedImage(url, block.type, templateWidth).then((width) => {
      updateProps({ src: url, width });
    });
  }

  return (
    <>
      <CollapsibleSection title="Source" defaultOpen>
        <ImageSourceCard
          value={src}
          disabled={!canEdit}
          showCrop
          naturalSize={naturalSize}
          onChange={(next) => updateProps({ src: next })}
          onPicked={pickImage}
          onNaturalSize={(size) => setMeasured({ src, ...size })}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Size & position" defaultOpen>
        <ImageSizeControls
          src={src}
          width={block.props.width}
          align={block.props.align}
          naturalWidth={naturalSize?.width ?? null}
          blockType={block.type}
          templateWidth={templateWidth}
          disabled={!canEdit}
          onWidthChange={(width) => updateProps({ width })}
          onAlignChange={(align) => updateProps({ align })}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Content" defaultOpen>
        <div className="flex flex-col gap-3">
          <InspectorRow
            label="Alt text"
            hint="Shown when the recipient blocks images."
          >
            <Input
              value={block.props.alt ?? ""}
              disabled={!canEdit}
              onChange={(event) => updateProps({ alt: event.target.value })}
            />
          </InspectorRow>
          <InspectorRow label="Link">
            <Input
              value={block.props.href ?? ""}
              placeholder="https://"
              mono
              disabled={!canEdit}
              leadingIcon={<Link className="size-3.5" strokeWidth={1.5} />}
              onChange={(event) => {
                const next = event.target.value.trim();
                updateProps({ href: next === "" ? undefined : next });
              }}
            />
          </InspectorRow>
        </div>
      </CollapsibleSection>
    </>
  );
}
