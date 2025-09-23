"use client";

import { useCallback } from "react";
import { AnyBlock, StyleField } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/StyleControls/ColorPicker";
import { TypographyControl } from "@/components/StyleControls/Typography/TypographyControls";
import { PaddingControls } from "@/components/StyleControls/Padding/PaddingControls";
import { BorderControls } from "@/components/StyleControls/Border/BorderControls";
import { Checkbox } from "@/components/ui/checkbox";

interface StyleControlsProps {
  selectedBlock: AnyBlock;
  fields: StyleField[];
  onStyleChange: (key: string, value: any) => void;
}

export default function StyleControls({
  selectedBlock,
  fields,
  onStyleChange,
}: StyleControlsProps) {
  const getNestedValue = useCallback((obj: any, key: string) => {
    if (!key.includes(".")) {
      return obj[key];
    }
    const keys = key.split(".");
    let current = obj;
    for (const k of keys) {
      if (current && typeof current === "object") {
        current = current[k];
      } else {
        return undefined;
      }
    }
    return current;
  }, []);

  const handleTypographyChange = useCallback(
    (styles: any) => {
      Object.entries(styles).forEach(([key, value]) => {
        onStyleChange(key, value);
      });
    },
    [onStyleChange],
  );

  const hasTypographyFields = fields.some((field) =>
    [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "color",
      "textAlign",
      "textDecoration",
      "textWrap",
    ].includes(field.key),
  );

  const hasPaddingFields = fields.some((field) =>
    ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"].includes(
      field.key,
    ),
  );

  const hasBorderFields = fields.some((field) =>
    field.key.startsWith("border"),
  );

  const nonTypographyFields = fields.filter(
    (field) =>
      ![
        "fontFamily",
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "color",
        "textAlign",
        "textDecoration",
        "textWrap",
        "paddingTop",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
      ].includes(field.key) && !field.key.startsWith("border"),
  );

  return (
    <div className="space-y-3">
      {hasPaddingFields && (
        <PaddingControls
          value={selectedBlock.styles}
          onChange={onStyleChange}
        />
      )}

      {hasBorderFields && (
        <BorderControls value={selectedBlock.styles} onChange={onStyleChange} />
      )}

      {hasTypographyFields &&
        (selectedBlock.type === "text" || selectedBlock.type === "button") && (
          <TypographyControl
            value={selectedBlock.styles}
            onChange={handleTypographyChange}
          />
        )}

      {nonTypographyFields.map((field) => {
        const value = getNestedValue(selectedBlock.styles, field.key);
        const id = `style-${String(field.key)}`;

        if (field.type === "number") {
          return (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={id}>{field.label}</Label>
              <Input
                id={id}
                type="number"
                value={typeof value === "number" ? value : ""}
                onChange={(e) =>
                  onStyleChange(
                    field.key,
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                min={field.min}
                step={field.step}
              />
            </div>
          );
        }

        if (field.type === "color") {
          return (
            <ColorPicker
              key={field.key}
              label={field.label}
              value={value as string}
              onChange={(color) => onStyleChange(field.key, color)}
            />
          );
        }

        if (field.type === "text") {
          return (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={id}>{field.label}</Label>
              <Input
                id={id}
                value={(value as string) ?? ""}
                onChange={(e) =>
                  onStyleChange(
                    field.key,
                    e.target.value === "" ? undefined : e.target.value,
                  )
                }
              />
            </div>
          );
        }

        if (field.type === "checkbox") {
          return (
            <div key={field.key} className="flex items-center gap-2">
              {/* <input
                id={id}
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => onStyleChange(field.key, e.target.checked)}
              /> */}
              <Checkbox
                id={id}
                checked={Boolean(value)}
                onCheckedChange={(checked) => onStyleChange(field.key, checked)}
              />
              <Label htmlFor={id}>{field.label}</Label>
            </div>
          );
        }

        if (field.type === "select" && field.options) {
          return (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={id}>{field.label}</Label>
              <select
                id={id}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={(value as string) ?? ""}
                onChange={(e) =>
                  onStyleChange(
                    field.key,
                    e.target.value === "" ? undefined : e.target.value,
                  )
                }
              >
                <option value=""></option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
