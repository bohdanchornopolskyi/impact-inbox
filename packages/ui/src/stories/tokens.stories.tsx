import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tokens/Colors",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Surfaces: Story = {
  render: () => {
    const swatches = [
      { name: "surface-page", className: "bg-surface-page" },
      { name: "surface-card", className: "bg-surface-card" },
      { name: "surface-muted", className: "bg-surface-muted" },
      { name: "accent", className: "bg-accent" },
      { name: "accent-soft", className: "bg-accent-soft" },
      { name: "status-success", className: "bg-status-success-bg" },
      { name: "status-warning", className: "bg-status-warning-bg" },
      { name: "status-danger", className: "bg-status-danger-bg" },
    ];

    return (
      <div className="grid w-[720px] grid-cols-4 gap-4">
        {swatches.map((swatch) => (
          <div key={swatch.name} className="space-y-2">
            <div
              className={`h-16 rounded-md border border-border-default ${swatch.className}`}
            />
            <p className="text-ui-xs text-text-secondary">{swatch.name}</p>
          </div>
        ))}
      </div>
    );
  },
};
