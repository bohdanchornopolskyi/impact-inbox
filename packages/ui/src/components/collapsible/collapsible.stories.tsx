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
    title: "Structure",
    defaultOpen: true,
    children: "Section → Row → Column → Heading block",
  },
};
