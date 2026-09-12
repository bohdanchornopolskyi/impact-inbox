import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChangeMarker } from "./change-marker";

const meta = {
  title: "Editor/Change Marker",
  component: ChangeMarker,
} satisfies Meta<typeof ChangeMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Edited: Story = {
  args: { tone: "edited", label: "Heading changed" },
  decorators: [
    (Story) => (
      <div className="flex h-16 justify-end">
        <Story />
      </div>
    ),
  ],
};

export const Added: Story = {
  args: { tone: "added", label: "Row added" },
  decorators: [
    (Story) => (
      <div className="flex h-10 justify-end">
        <Story />
      </div>
    ),
  ],
};
