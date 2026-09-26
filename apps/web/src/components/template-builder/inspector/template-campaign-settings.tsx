"use client";

import type { TemplateContentData } from "@repo/shared";
import { CollapsibleSection } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import { BooleanField, TextField } from "./fields";

function footerAddress(content: TemplateContentData) {
  for (const section of content.body) {
    for (const row of section.children) {
      for (const column of row.children) {
        for (const block of column.children) {
          if (block.type === "footer" && block.props.address) {
            return { id: block.id, address: block.props.address };
          }
        }
      }
    }
  }
  return undefined;
}

export function TemplateCampaignSettings() {
  const canEdit = useBuilder((s) => s.canEdit);
  const content = useBuilder((s) => s.content);
  const settings = content.settings;
  const updateSettingsAction = useBuilder((s) => s.updateSettings);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const address = footerAddress(content);

  function updateSettings(partial: Partial<typeof settings>) {
    if (!canEdit) {
      return;
    }
    updateSettingsAction(partial);
  }

  return (
    <>
      <CollapsibleSection title="Sender" defaultOpen>
        <div className="flex flex-col gap-3">
          <TextField
            label="From name"
            value={settings.fromName ?? ""}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ fromName: value })}
          />
          <TextField
            label="From email"
            value={settings.fromEmail ?? ""}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ fromEmail: value })}
          />
          <TextField
            label="Reply-to"
            value={settings.replyTo ?? ""}
            disabled={!canEdit}
            onChange={(value) => updateSettings({ replyTo: value })}
          />
          <p className="text-[11.5px] leading-snug text-text-2">
            From email must be on a verified domain. Manage domains in Workspace settings.
          </p>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Tracking" defaultOpen>
        <div className="flex flex-col gap-3">
          <BooleanField
            label="Track opens"
            checked={settings.trackOpens ?? true}
            disabled={!canEdit}
            onChange={(checked) => updateSettings({ trackOpens: checked })}
          />
          <BooleanField
            label="Track link clicks"
            checked={settings.trackClicks ?? true}
            disabled={!canEdit}
            onChange={(checked) => updateSettings({ trackClicks: checked })}
          />
          <BooleanField
            label="Add UTM tags to links"
            checked={Boolean(settings.utmEnabled)}
            disabled={!canEdit}
            onChange={(checked) => updateSettings({ utmEnabled: checked ? true : undefined })}
          />
          {settings.utmEnabled ? (
            <TextField
              label="Campaign"
              value={settings.utmCampaign ?? ""}
              disabled={!canEdit}
              onChange={(value) => updateSettings({ utmCampaign: value })}
            />
          ) : null}
          <p className="text-[11.5px] leading-snug text-text-2">
            Apple Mail privacy protection inflates open rates. Clicks are the more reliable signal.
          </p>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Compliance" defaultOpen>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-2">Postal address in footer</span>
              {address ? (
                <button
                  type="button"
                  className="text-xs font-medium text-accent"
                  onClick={() => {
                    selectBlock(address.id);
                    setInspectorMode("block");
                  }}
                >
                  Edit
                </button>
              ) : null}
            </div>
            <p className="text-xs text-text">
              {address?.address ?? "Add a footer block to show your postal address."}
            </p>
          </div>
          <BooleanField
            label="Unsubscribe link is in the footer"
            checked={settings.unsubscribeInFooter ?? true}
            disabled={!canEdit}
            onChange={(checked) => updateSettings({ unsubscribeInFooter: checked })}
          />
          <BooleanField
            label="Auto-generate plain-text version"
            checked={settings.autoPlainText ?? true}
            disabled={!canEdit}
            onChange={(checked) => updateSettings({ autoPlainText: checked })}
          />
        </div>
      </CollapsibleSection>
    </>
  );
}
