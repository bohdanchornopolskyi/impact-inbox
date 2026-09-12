import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectTile } from "./aspect-tile";

const meta = {
  title: "Editor/Aspect Tile",
  component: AspectTile,
  args: {
    label: "16:9",
    width: 16,
    height: 9,
  },
} satisfies Meta<typeof AspectTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};
