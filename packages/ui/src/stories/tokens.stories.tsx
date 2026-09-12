import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Tokens/Colors",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function SwatchGrid({
  swatches,
}: {
  swatches: { name: string; className: string }[];
}) {
  return (
    <div className="grid w-[880px] grid-cols-4 gap-4">
      {swatches.map((swatch) => (
        <div key={swatch.name} className="space-y-2">
          <div
            className={`h-16 rounded-md border border-border-default ${swatch.className}`}
          />
          <p className="font-mono text-2xs text-text-2">{swatch.name}</p>
        </div>
      ))}
    </div>
  );
}

export const Surfaces: Story = {
  render: () => (
    <SwatchGrid
      swatches={[
        { name: "bg", className: "bg-bg" },
        { name: "surface", className: "bg-surface" },
        { name: "surface-sunken", className: "bg-surface-sunken" },
        { name: "canvas-bg", className: "bg-canvas-bg" },
        { name: "accent", className: "bg-accent" },
        { name: "accent-soft", className: "bg-accent-soft" },
        { name: "success", className: "bg-status-success-bg" },
        { name: "warning", className: "bg-status-warning-bg" },
        { name: "danger", className: "bg-status-danger-bg" },
        { name: "info", className: "bg-status-info-bg" },
      ]}
    />
  ),
};

export const Neutral: Story = {
  render: () => (
    <SwatchGrid
      swatches={[
        { name: "neutral-0", className: "bg-neutral-0" },
        { name: "neutral-25", className: "bg-neutral-25" },
        { name: "neutral-50", className: "bg-neutral-50" },
        { name: "neutral-100", className: "bg-neutral-100" },
        { name: "neutral-200", className: "bg-neutral-200" },
        { name: "neutral-300", className: "bg-neutral-300" },
        { name: "neutral-400", className: "bg-neutral-400" },
        { name: "neutral-500", className: "bg-neutral-500" },
        { name: "neutral-600", className: "bg-neutral-600" },
        { name: "neutral-700", className: "bg-neutral-700" },
        { name: "neutral-800", className: "bg-neutral-800" },
        { name: "neutral-900", className: "bg-neutral-900" },
        { name: "neutral-950", className: "bg-neutral-950" },
      ]}
    />
  ),
};

export const Brand: Story = {
  render: () => (
    <SwatchGrid
      swatches={[
        { name: "brand-50", className: "bg-brand-50" },
        { name: "brand-100", className: "bg-brand-100" },
        { name: "brand-200", className: "bg-brand-200" },
        { name: "brand-300", className: "bg-brand-300" },
        { name: "brand-400", className: "bg-brand-400" },
        { name: "brand-500", className: "bg-brand-500" },
        { name: "brand-600", className: "bg-brand-600" },
        { name: "brand-700", className: "bg-brand-700" },
      ]}
    />
  ),
};

export const TypeScale: Story = {
  render: () => (
    <div className="space-y-4 text-text">
      <p className="text-display font-bold leading-tight tracking-tight">
        Display · 36
      </p>
      <p className="text-4xl font-bold leading-tight tracking-tight">
        Heading 1 · 30
      </p>
      <p className="text-3xl font-bold leading-tight">Heading 2 · 24</p>
      <p className="text-2xl font-semibold leading-snug">Heading 3 · 20</p>
      <p className="text-xl font-semibold leading-snug">Heading 4 · 18</p>
      <p className="text-lg leading-normal">Body large · 16</p>
      <p className="text-md leading-normal">Body · 14</p>
      <p className="text-sm leading-normal">Body small / label · 13</p>
      <p className="text-xs leading-snug">Caption · 12</p>
      <p className="text-2xs font-semibold leading-snug tracking-wide uppercase">
        Overline · 11
      </p>
      <p className="font-mono text-sm font-medium">bohdan-s-workspace</p>
    </div>
  ),
};
