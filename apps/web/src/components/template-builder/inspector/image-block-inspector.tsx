"use client";

import { useState } from "react";
import type { ContentBlock } from "@repo/shared";
import {
  CollapsibleSection,
  Input,
  InspectorRow,
  Stepper,
} from "@repo/ui/client";
import { Link, Plus, Trash2 } from "lucide-react";
import { isPlaceholderImageSrc } from "./image-display-width";
import {
  type ImageNaturalSize,
  widthForPickedImage,
} from "./image-display-width";
import { ImageCropDialog } from "./image-crop-dialog";
import { ImageSizeControls } from "./image-size-controls";
import { ImageSourceCard } from "./image-source-field";
import { BooleanField } from "./fields";
import { ColorPickerField } from "./color-picker-field";

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
  const [cropOpen, setCropOpen] = useState(false);
  const [measured, setMeasured] = useState<
    (ImageNaturalSize & { src: string }) | null
  >(null);
  const naturalSize = measured?.src === src ? measured : null;
  const hasImage = src.length > 0 && !isPlaceholderImageSrc(src);

  function pickImage(url: string) {
    void widthForPickedImage(url, block.type, templateWidth).then((width) => {
      updateProps({ src: url, width });
    });
  }

  if (block.type === "logo") {
    const links = block.props.links ?? [];
    const logoWidth = typeof block.props.width === "number" ? block.props.width : 120;

    return (
      <CollapsibleSection title="Logo & links" defaultOpen>
        <div className="flex flex-col gap-3">
          <ImageSourceCard
            value={src}
            disabled={!canEdit}
            naturalSize={naturalSize}
            onChange={(next) => updateProps({ src: next })}
            onPicked={pickImage}
            onNaturalSize={(size) => setMeasured({ src, ...size })}
          />
          <InspectorRow label="Logo width">
            <Stepper
              aria-label="Logo width"
              value={logoWidth}
              min={1}
              max={600}
              disabled={!canEdit}
              onValueChange={(width) => updateProps({ width })}
            />
          </InspectorRow>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-text-2">Links</span>
            {links.map((link, index) => (
              <div key={`${link.text}-${index}`} className="flex items-center gap-1.5">
                <Input
                  aria-label={`Link ${index + 1} label`}
                  value={link.text}
                  disabled={!canEdit}
                  onChange={(event) => {
                    const next = links.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: event.target.value } : item,
                    );
                    updateProps({ links: next });
                  }}
                />
                <button
                  type="button"
                  aria-label="Remove link"
                  disabled={!canEdit}
                  className="inline-flex size-8 items-center justify-center text-text-3"
                  onClick={() =>
                    updateProps({ links: links.filter((_, itemIndex) => itemIndex !== index) })
                  }
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={!canEdit}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent"
              onClick={() =>
                updateProps({ links: [...links, { text: "Link", href: "https://" }] })
              }
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
              Add link
            </button>
          </div>
          <ColorPickerField
            label="Link color"
            value={block.props.linkColor}
            disabled={!canEdit}
            onChange={(linkColor) => updateProps({ linkColor })}
          />
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <>
      <CollapsibleSection title="Source" defaultOpen>
        <div className="flex flex-col gap-3">
          <ImageSourceCard
            value={src}
            disabled={!canEdit}
            showCrop={hasImage}
            naturalSize={naturalSize}
            onChange={(next) => updateProps({ src: next })}
            onPicked={pickImage}
            onNaturalSize={(size) => setMeasured({ src, ...size })}
            onCrop={() => setCropOpen(true)}
          />
          {hasImage ? null : (
            <p className="text-[11.5px] leading-snug text-text-2">
              Size, alt text and link show up once the block has an image.
            </p>
          )}
        </div>
      </CollapsibleSection>
      {hasImage ? (
        <>
          <CollapsibleSection title="Size & position" defaultOpen>
            <div className="flex flex-col gap-3">
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
              <BooleanField
                label="Full width on mobile"
                checked={Boolean(block.props.fullWidthOnMobile)}
                disabled={!canEdit}
                onChange={(checked) =>
                  updateProps({ fullWidthOnMobile: checked ? true : undefined })
                }
              />
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Content" defaultOpen>
            <div className="flex flex-col gap-3">
              <InspectorRow
                label="Alt text"
                hint="Shown when the recipient blocks images."
              >
                <Input
                  value={block.props.decorative ? "" : (block.props.alt ?? "")}
                  disabled={!canEdit || Boolean(block.props.decorative)}
                  onChange={(event) => updateProps({ alt: event.target.value })}
                />
              </InspectorRow>
              <BooleanField
                label="Decorative image, no alt text"
                checked={Boolean(block.props.decorative)}
                disabled={!canEdit}
                onChange={(checked) =>
                  updateProps({
                    decorative: checked ? true : undefined,
                    alt: checked ? "" : block.props.alt,
                  })
                }
              />
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
      ) : null}
      {cropOpen ? (
        <ImageCropDialog
          block={block}
          sourceWidth={naturalSize?.width ?? 0}
          sourceHeight={naturalSize?.height ?? 0}
          disabled={!canEdit}
          onClose={() => setCropOpen(false)}
          updateProps={updateProps}
        />
      ) : null}
    </>
  );
}
