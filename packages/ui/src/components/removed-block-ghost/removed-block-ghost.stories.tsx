import type { Meta, StoryObj } from "@storybook/react-vite";
import { RemovedBlockGhost } from "./removed-block-ghost";

const meta = {
  title: "Editor/Removed Block Ghost",
  component: RemovedBlockGhost,
  args: {
    label: "Social links removed in this version",
  },
} satisfies Meta<typeof RemovedBlockGhost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
