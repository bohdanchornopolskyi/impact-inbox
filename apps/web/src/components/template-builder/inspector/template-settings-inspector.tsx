"use client";

import { useRef } from "react";
import { Button } from "@repo/ui/client";
import {
  DEFAULT_TEMPLATE_SETTINGS,
  TEMPLATE_DEFAULT_COLORS,
} from "@repo/shared";
import { useBuilder } from "../builder-provider";
import { ColorField, NumberField, TextField } from "./fields";
import { insertAtSelection } from "./insert-at-selection";
import { MergeTagPicker } from "./merge-tag-picker";

type MergeTagField = "subject" | "preheader";

export function TemplateSettingsInspector() {
  const canEdit = useBuilder((s) => s.canEdit);
  const settings = useBuilder((s) => s.content.settings);
  const updateSettingsAction = useBuilder((s) => s.updateSettings);
  const selectBlock = useBuilder((s) => s.selectBlock);

  const subjectRef = useRef<HTMLInputElement>(null);
  const preheaderRef = useRef<HTMLInputElement>(null);
  const mergeTagFieldRef = useRef<MergeTagField>("subject");

  function updateSettings(partial: Partial<typeof settings>) {
    if (!canEdit) {
      return;
    }

    updateSettingsAction(partial);
  }

  /** Writes the tag into whichever of subject/preheader was focused last. */
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-ui-sm font-semibold text-text-primary">
            Template settings
          </h2>
          <p className="mt-0.5 text-ui-xs text-text-tertiary">
            Subject, layout, and default styles for this template.
          </p>
        </div>
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
      <NumberField
        label="Width (px)"
        value={settings.width}
        min={480}
        max={700}
        onChange={(value) => updateSettings({ width: value ?? 600 })}
      />
      <ColorField
        label="Background color"
        value={settings.backgroundColor}
        fallback={DEFAULT_TEMPLATE_SETTINGS.backgroundColor}
        onChange={(value) => updateSettings({ backgroundColor: value })}
      />
      <ColorField
        label="Content background"
        value={settings.contentBackgroundColor}
        fallback={DEFAULT_TEMPLATE_SETTINGS.contentBackgroundColor}
        onChange={(value) => updateSettings({ contentBackgroundColor: value })}
      />
      <TextField
        label="Font family"
        value={settings.fontFamily ?? ""}
        onChange={(value) => updateSettings({ fontFamily: value })}
      />
      <NumberField
        label="Font size"
        value={settings.fontSize}
        min={8}
        max={72}
        onChange={(value) => updateSettings({ fontSize: value })}
      />
      <NumberField
        label="Line height"
        value={settings.lineHeight}
        min={1}
        max={3}
        onChange={(value) => updateSettings({ lineHeight: value })}
      />
      <ColorField
        label="Text color"
        value={settings.textColor}
        fallback={TEMPLATE_DEFAULT_COLORS.text}
        onChange={(value) => updateSettings({ textColor: value })}
      />
      <ColorField
        label="Link color"
        value={settings.linkColor}
        fallback={TEMPLATE_DEFAULT_COLORS.link}
        onChange={(value) => updateSettings({ linkColor: value })}
      />
      <Button
        variant="soft"
        size="sm"
        onClick={() => selectBlock(null)}
      >
        Clear block selection
      </Button>
    </div>
  );
}
