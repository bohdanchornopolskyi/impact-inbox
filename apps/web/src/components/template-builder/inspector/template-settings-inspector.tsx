"use client";

import { useRef } from "react";
import { CollapsibleSection } from "@repo/ui/client";
import {
  DEFAULT_TEMPLATE_SETTINGS,
  TEMPLATE_DEFAULT_COLORS,
} from "@repo/shared";
import { useBuilder } from "../builder-provider";
import { ColorPickerField } from "./color-picker-field";
import { NumberField, TextField } from "./fields";
import { insertAtSelection } from "./insert-at-selection";
import { MergeTagPicker } from "./merge-tag-picker";

type MergeTagField = "subject" | "preheader";

export function TemplateSettingsInspector() {
  const canEdit = useBuilder((s) => s.canEdit);
  const settings = useBuilder((s) => s.content.settings);
  const updateSettingsAction = useBuilder((s) => s.updateSettings);

  const subjectRef = useRef<HTMLInputElement>(null);
  const preheaderRef = useRef<HTMLInputElement>(null);
  const mergeTagFieldRef = useRef<MergeTagField>("subject");

  function updateSettings(partial: Partial<typeof settings>) {
    if (!canEdit) {
      return;
    }

    updateSettingsAction(partial);
  }

  function insertMergeTag(formattedTag: string) {
    if (!canEdit) {
      return;
    }

    const field = mergeTagFieldRef.current;
    const input =
      field === "subject" ? subjectRef.current : preheaderRef.current;
    const next = insertAtSelection(
      settings[field] ?? "",
      formattedTag,
      input?.selectionStart,
      input?.selectionEnd,
    );

    updateSettings({ [field]: next.value });

    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(next.caret, next.caret);
    });
  }

  return (
    <>
      <CollapsibleSection title="Email" defaultOpen>
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <MergeTagPicker onInsert={insertMergeTag} />
          </div>
          <TextField
            label="Subject"
            value={settings.subject ?? ""}
            inputRef={subjectRef}
            onFocus={() => {
              mergeTagFieldRef.current = "subject";
            }}
            onChange={(value) => updateSettings({ subject: value })}
          />
          <TextField
            label="Preheader"
            value={settings.preheader ?? ""}
            inputRef={preheaderRef}
            onFocus={() => {
              mergeTagFieldRef.current = "preheader";
            }}
            onChange={(value) => updateSettings({ preheader: value })}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Layout" defaultOpen>
        <NumberField
          label="Width"
          unit="px"
          value={settings.width}
          min={480}
          max={700}
          onChange={(value) => updateSettings({ width: value ?? 600 })}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Colors" summary="Canvas">
        <div className="flex flex-col gap-3">
          <ColorPickerField
            label="Canvas"
            value={settings.backgroundColor}
            fallback={DEFAULT_TEMPLATE_SETTINGS.backgroundColor}
            onChange={(value) => updateSettings({ backgroundColor: value })}
          />
          <ColorPickerField
            label="Content"
            value={settings.contentBackgroundColor}
            fallback={DEFAULT_TEMPLATE_SETTINGS.contentBackgroundColor}
            onChange={(value) =>
              updateSettings({ contentBackgroundColor: value })
            }
          />
          <ColorPickerField
            label="Text"
            value={settings.textColor}
            fallback={TEMPLATE_DEFAULT_COLORS.text}
            onChange={(value) => updateSettings({ textColor: value })}
          />
          <ColorPickerField
            label="Link"
            value={settings.linkColor}
            fallback={TEMPLATE_DEFAULT_COLORS.link}
            onChange={(value) => updateSettings({ linkColor: value })}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Typography" summary={settings.fontFamily || "Default"}>
        <div className="flex flex-col gap-3">
          <TextField
            label="Font"
            value={settings.fontFamily ?? ""}
            onChange={(value) => updateSettings({ fontFamily: value })}
          />
          <NumberField
            label="Size"
            unit="px"
            value={settings.fontSize}
            min={8}
            max={72}
            onChange={(value) => updateSettings({ fontSize: value })}
          />
          <NumberField
            label="Line"
            value={settings.lineHeight}
            min={1}
            max={3}
            onChange={(value) => updateSettings({ lineHeight: value })}
          />
        </div>
      </CollapsibleSection>
    </>
  );
}
