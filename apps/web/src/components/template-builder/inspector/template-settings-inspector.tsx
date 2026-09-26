"use client";

import { CollapsibleSection, InspectorRow, SegmentedControl, inspectorControlClass } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import { ColorPickerField } from "./color-picker-field";
import { NumberField, TextField } from "./fields";

function isWebFont(font: string | undefined) {
  const value = font?.toLowerCase() ?? "";
  return value.includes("inter") || (value.length > 0 && !value.includes("arial") && !value.includes("georgia") && !value.includes("times"));
}

export function TemplateSettingsInspector() {
  const canEdit = useBuilder((s) => s.canEdit);
  const settings = useBuilder((s) => s.content.settings);
  const updateSettingsAction = useBuilder((s) => s.updateSettings);

  function updateSettings(partial: Partial<typeof settings>) {
    if (!canEdit) {
      return;
    }
    updateSettingsAction(partial);
  }

  const headingFont = settings.headingFontFamily ?? "";
  const bodyFont = settings.fontFamily ?? "";
  const showWebFontNote = isWebFont(headingFont) || isWebFont(bodyFont);

  return (
    <>
      <CollapsibleSection title="Layout" defaultOpen>
        <div className="flex flex-col gap-3">
          <NumberField
            label="Width"
            unit="px"
            value={settings.width}
            min={480}
            max={700}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ width: value ?? 600 })}
          />
          <ColorPickerField
            label="Page"
            value={settings.backgroundColor}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ backgroundColor: value })}
          />
          <ColorPickerField
            label="Email"
            value={settings.contentBackgroundColor}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ contentBackgroundColor: value })}
          />
          <NumberField
            label="Corners"
            unit="px"
            value={settings.contentRadius}
            min={0}
            max={40}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ contentRadius: value })}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Text" defaultOpen>
        <div className="flex flex-col gap-3">
          <TextField
            label="Headings"
            value={headingFont}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ headingFontFamily: value })}
          />
          <TextField
            label="Body"
            value={bodyFont}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ fontFamily: value })}
          />
          {showWebFontNote ? (
            <p className="text-[11.5px] leading-snug text-text-2">
              This is a web font. Outlook and most Gmail apps show Arial instead.
            </p>
          ) : null}
          <NumberField
            label="Body size"
            unit="px"
            value={settings.fontSize}
            min={8}
            max={72}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ fontSize: value })}
          />
          <ColorPickerField
            label="Text color"
            value={settings.textColor}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ textColor: value })}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Links & buttons" defaultOpen>
        <div className="flex flex-col gap-3">
          <ColorPickerField
            label="Links"
            value={settings.linkColor}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ linkColor: value })}
          />
          <InspectorRow label="Underline">
            <SegmentedControl
              className={inspectorControlClass}
              disabled={!canEdit}
              value={settings.linkUnderline ?? "always"}
              onChange={(value) =>
                updateSettings({
                  linkUnderline: value as "always" | "hover" | "never",
                })
              }
              options={[
                { value: "always", label: "Always" },
                { value: "hover", label: "On hover" },
                { value: "never", label: "Never" },
              ]}
            />
          </InspectorRow>
          <InspectorRow label="Buttons">
            <SegmentedControl
              className={inspectorControlClass}
              disabled={!canEdit}
              value={settings.buttonStyle ?? "filled"}
              onChange={(value) =>
                updateSettings({ buttonStyle: value as "filled" | "outline" })
              }
              options={[
                { value: "filled", label: "Filled" },
                { value: "outline", label: "Outline" },
              ]}
            />
          </InspectorRow>
          <NumberField
            label="Button radius"
            unit="px"
            value={settings.buttonRadius}
            min={0}
            max={40}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ buttonRadius: value })}
          />
        </div>
      </CollapsibleSection>
    </>
  );
}
