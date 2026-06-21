"use client";

import { Button } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import { ColorField, NumberField, TextField } from "./fields";
import { MergeTagPicker } from "./merge-tag-picker";

export function TemplateSettingsInspector() {
  const canEdit = useBuilder((s) => s.canEdit);
  const settings = useBuilder((s) => s.content.settings);
  const updateSettingsAction = useBuilder((s) => s.updateSettings);
  const selectBlock = useBuilder((s) => s.selectBlock);

  function updateSettings(partial: Partial<typeof settings>) {
    if (!canEdit) {
      return;
    }

    updateSettingsAction(partial);
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
        <MergeTagPicker />
      </div>
      <TextField
        label="Subject"
        value={settings.subject ?? ""}
        onChange={(value) => updateSettings({ subject: value })}
      />
      <TextField
        label="Preheader"
        value={settings.preheader ?? ""}
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
        onChange={(value) => updateSettings({ backgroundColor: value })}
      />
      <ColorField
        label="Content background"
        value={settings.contentBackgroundColor}
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
        onChange={(value) => updateSettings({ textColor: value })}
      />
      <ColorField
        label="Link color"
        value={settings.linkColor}
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
