import type { Meta, StoryObj } from "@storybook/react-vite";
import { SavedTile } from "./saved-tile";

const meta = {
  title: "Editor/Saved Tile",
  component: SavedTile,
  args: {
    name: "Header",
    summary: "Logo, Heading",
    onInsert: () => undefined,
    onUpdate: () => undefined,
    onMore: () => undefined,
  },
} satisfies Meta<typeof SavedTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  render: (args) => (
    <SavedTile name={args.name} summary={args.summary} onInsert={args.onInsert} />
  ),
};
