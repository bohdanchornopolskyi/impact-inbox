"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@repo/ui/client";
import {
  brandKitFromData,
  hasWorkspaceRoleAtLeast,
  normalizeBrandKit,
  TEMPLATE_DEFAULT_COLORS,
  TEMPLATE_DEFAULT_SPACING,
  type BrandKitFields,
} from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useUpdateWorkspaceSettings } from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { ColorPickerField } from "@/components/template-builder/inspector/color-picker-field";

export function WorkspaceBrandSection() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const updateWorkspaceSettings = useUpdateWorkspaceSettings();
  const update = useToastMutation({
    mutationFn: (
      input: Parameters<typeof updateWorkspaceSettings.mutateAsync>[0],
    ) => updateWorkspaceSettings.mutateAsync(input),
    successMessage: "Brand saved. New blocks and templates will use it.",
    errorMessage: "Could not update brand kit",
  });
  const [fields, setFields] = useState<BrandKitFields>(() =>
    brandKitFromData(workspace.brandKit),
  );

  useEffect(() => {
    setFields(brandKitFromData(workspace.brandKit));
  }, [workspace.brandKit]);

  function patchColor(key: keyof NonNullable<BrandKitFields["colors"]>, value: string) {
    setFields((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }

  function patchSpacing(
    key: keyof NonNullable<BrandKitFields["spacing"]>,
    value: number | undefined,
  ) {
    setFields((prev) => ({
      ...prev,
      spacing: { ...prev.spacing, [key]: value },
    }));
  }

  if (!canManage) {
    return (
      <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
        <h2 className="text-ui-lg font-medium text-text-primary">Brand</h2>
        <p className="mt-2 text-ui-sm text-text-secondary">
          Only workspace admins can edit the brand kit.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-ui-lg font-medium text-text-primary">Brand</h2>
        <p className="text-ui-sm text-text-secondary">
          Colors and spacing baked into new templates and blocks. Existing
          content is unchanged.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <ColorPickerField
          label="Primary"
          value={fields.colors?.primary}
          fallback={TEMPLATE_DEFAULT_COLORS.buttonBackground}
          onChange={(value) => patchColor("primary", value)}
        />
        <ColorPickerField
          label="On primary"
          value={fields.colors?.onPrimary}
          fallback={TEMPLATE_DEFAULT_COLORS.buttonText}
          onChange={(value) => patchColor("onPrimary", value)}
        />
        <ColorPickerField
          label="Text"
          value={fields.colors?.text}
          fallback={TEMPLATE_DEFAULT_COLORS.text}
          onChange={(value) => patchColor("text", value)}
        />
        <ColorPickerField
          label="Heading"
          value={fields.colors?.heading}
          fallback={TEMPLATE_DEFAULT_COLORS.heading}
          onChange={(value) => patchColor("heading", value)}
        />
        <ColorPickerField
          label="Page background"
          value={fields.colors?.pageBackground}
          fallback={TEMPLATE_DEFAULT_COLORS.pageBackground}
          onChange={(value) => patchColor("pageBackground", value)}
        />
        <ColorPickerField
          label="Content background"
          value={fields.colors?.contentBackground}
          fallback={TEMPLATE_DEFAULT_COLORS.contentBackground}
          onChange={(value) => patchColor("contentBackground", value)}
        />
        <ColorPickerField
          label="Link"
          value={fields.colors?.link}
          fallback={TEMPLATE_DEFAULT_COLORS.link}
          onChange={(value) => patchColor("link", value)}
        />

        <label className="block space-y-1.5">
          <span className="text-ui-sm font-medium text-text-primary">
            Logo URL
          </span>
          <Input
            value={fields.logoUrl ?? ""}
            placeholder="https://"
            onChange={(event) =>
              setFields((prev) => ({ ...prev, logoUrl: event.target.value }))
            }
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-ui-sm font-medium text-text-primary">
            Font family
          </span>
          <Input
            value={fields.fontFamily ?? ""}
            placeholder="Arial, sans-serif"
            onChange={(event) =>
              setFields((prev) => ({ ...prev, fontFamily: event.target.value }))
            }
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-ui-sm font-medium text-text-primary">
            Section padding (px)
          </span>
          <Input
            type="number"
            value={
              fields.spacing?.sectionPadding ??
              TEMPLATE_DEFAULT_SPACING.sectionPadding
            }
            onChange={(event) => {
              const next = Number(event.target.value);
              patchSpacing(
                "sectionPadding",
                Number.isFinite(next) ? next : undefined,
              );
            }}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-ui-sm font-medium text-text-primary">
            Content block gap (px)
          </span>
          <Input
            type="number"
            value={
              fields.spacing?.contentBlockGap ??
              TEMPLATE_DEFAULT_SPACING.contentBlockGap
            }
            onChange={(event) => {
              const next = Number(event.target.value);
              patchSpacing(
                "contentBlockGap",
                Number.isFinite(next) ? next : undefined,
              );
            }}
          />
        </label>
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          size="sm"
          disabled={update.isPending}
          onClick={() =>
            update.mutate({
              workspaceId: workspace.id,
              input: { brandKit: normalizeBrandKit(fields) },
            })
          }
        >
          Save brand
        </Button>
      </div>
    </section>
  );
}
