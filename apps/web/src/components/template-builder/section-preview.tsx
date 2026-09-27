"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  PLACEHOLDER_IMAGE_URL,
  type BlockStyles,
  type ContentBlock,
  type RowBlock,
  type SectionBlock,
} from "@repo/shared";

const PREVIEW_WIDTH = 600;

function paddingStyle(styles: BlockStyles | undefined): CSSProperties {
  const padding = styles?.padding;
  if (padding == null) {
    return {};
  }
  if (typeof padding === "number") {
    return { padding };
  }
  return {
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
  };
}

function alignStyle(styles: BlockStyles | undefined): CSSProperties {
  if (!styles?.textAlign) {
    return {};
  }
  return { textAlign: styles.textAlign };
}

function PreviewBlock({ block }: { block: ContentBlock }) {
  const box: CSSProperties = {
    ...paddingStyle(block.styles),
    ...alignStyle(block.styles),
  };

  if (block.type === "heading" || block.type === "text") {
    return (
      <p
        style={{
          ...box,
          margin: 0,
          color: block.props.color,
          fontSize: block.props.fontSize ?? (block.type === "heading" ? 24 : 14),
          fontWeight: block.type === "heading" ? block.props.fontWeight ?? 600 : block.props.fontWeight,
          lineHeight: block.props.lineHeight ?? 1.3,
          letterSpacing: block.styles?.letterSpacing,
          textTransform: block.props.textTransform,
        }}
      >
        {block.props.text}
      </p>
    );
  }

  if (block.type === "button") {
    return (
      <div style={box}>
        <span
          style={{
            display: "inline-block",
            background: block.props.backgroundColor ?? "#111827",
            color: block.props.textColor ?? "#ffffff",
            borderRadius: block.props.borderRadius ?? 6,
            fontSize: block.props.fontSize ?? 14,
            padding: `${block.props.paddingY ?? 12}px ${block.props.paddingX ?? 20}px`,
          }}
        >
          {block.props.text}
        </span>
      </div>
    );
  }

  if (block.type === "image" || block.type === "logo" || block.type === "video") {
    const src = block.type === "video" ? block.props.thumbnailSrc : block.props.src;
    const blank = !src || src === PLACEHOLDER_IMAGE_URL;
    return (
      <div style={box}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {blank ? (
            <div
              style={{
                flex: block.type === "logo" ? "0 0 96px" : "1 1 auto",
                height: block.type === "logo" ? 28 : 120,
                borderRadius: block.props.borderRadius ?? 4,
                background: "#e5e7eb",
              }}
            />
          ) : (
            <img
              alt=""
              src={src}
              style={{
                display: "block",
                width: block.type === "logo" ? block.props.width ?? 120 : "100%",
                maxHeight: block.type === "logo" ? 48 : 160,
                objectFit: "cover",
                borderRadius: block.props.borderRadius,
              }}
            />
          )}
          {block.type === "logo" && block.props.links?.length ? (
            <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", gap: 16 }}>
              {block.props.links.map((link) => (
                <span key={link.text} style={{ fontSize: 13, color: block.props.linkColor }}>
                  {link.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (block.type === "divider") {
    return (
      <div style={box}>
        <div
          style={{
            height: block.props.thickness ?? 1,
            background: block.props.color ?? "#e5e7eb",
          }}
        />
      </div>
    );
  }

  if (block.type === "spacer") {
    return <div style={{ height: Math.min(block.props.height, 32) }} />;
  }

  if (block.type === "social") {
    return (
      <div style={{ ...box, display: "flex", justifyContent: "center", gap: block.props.gap ?? 12 }}>
        {block.props.links.map((link) => (
          <span
            key={link.platform}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: block.props.backgroundColor ?? "#eef0f3",
            }}
          />
        ))}
      </div>
    );
  }

  if (block.type === "footer") {
    const line = [block.props.companyName, block.props.address].filter(Boolean).join(", ");
    return (
      <div style={{ ...box, textAlign: block.props.align ?? "center", color: block.props.textColor ?? "#6b7280", fontSize: block.props.fontSize ?? 12 }}>
        {line ? <p style={{ margin: "0 0 6px" }}>{line}</p> : null}
        {block.props.copyright ? <p style={{ margin: "0 0 6px" }}>{block.props.copyright}</p> : null}
        <p style={{ margin: 0 }}>
          {(block.props.links ?? []).map((link) => link.text).join("  ·  ")}
          {block.props.unsubscribeLabel ? `  ·  ${block.props.unsubscribeLabel}` : ""}
        </p>
      </div>
    );
  }

  if (block.type === "richtext") {
    return (
      <p style={{ ...box, margin: 0, fontSize: block.props.fontSize ?? 14 }}>
        {block.props.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
      </p>
    );
  }

  return null;
}

function PreviewRow({ row }: { row: RowBlock }) {
  return (
    <div style={{ display: "flex", gap: row.props.gap ?? 0, ...paddingStyle(row.styles) }}>
      {row.children.map((column, index) => {
        const width = row.props.columnWidths?.[index];
        return (
          <div
            key={column.id}
            style={{
              flex: width == null ? "1 1 0" : `0 0 ${width}%`,
              minWidth: 0,
              ...paddingStyle(column.styles),
            }}
          >
            {column.children.map((block) => (
              <PreviewBlock key={block.id} block={block} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function SectionPreview({ section }: { section: SectionBlock }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const background = section.styles?.backgroundColor ?? "#ffffff";

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    function updateScale() {
      const width = frame?.clientWidth ?? PREVIEW_WIDTH;
      setScale(width / PREVIEW_WIDTH);
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="relative h-44 overflow-hidden"
      style={{ background }}
    >
      <div
        className="pointer-events-none absolute top-0 left-0"
        style={{
          width: PREVIEW_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background,
          ...paddingStyle(section.styles),
        }}
      >
        {section.children.map((row) => (
          <PreviewRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
