import type { Meta, StoryObj } from "@storybook/react";
import { CollapsibleSection } from "./collapsible";

const meta = {
  title: "Overlays/Collapsible",
  component: CollapsibleSection,
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Spacing",
    defaultOpen: true,
    children: "Padding and margin controls",
  },
};

export const InspectorStack: Story = {
  args: {
    title: "Size & alignment",
    defaultOpen: true,
    children: "Width and align controls",
  },
  render: function Render() {
    return (
      <div className="w-[340px] border-y border-border">
        <CollapsibleSection title="Size & alignment" defaultOpen>
          Width and align controls
        </CollapsibleSection>
        <CollapsibleSection title="Spacing" defaultOpen>
          Padding and gap controls
        </CollapsibleSection>
        <CollapsibleSection title="Background">
          Fill and color controls
        </CollapsibleSection>
        <CollapsibleSection title="Typography">
          Font and alignment controls
        </CollapsibleSection>
      </div>
    );
  },
};
