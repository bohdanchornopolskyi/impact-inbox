import type { Meta, StoryObj } from "@storybook/react-vite";
import { LibraryTile } from "./library-tile";

const meta = {
  title: "Editor/Library Tile",
  component: LibraryTile,
  args: {
    filename: "image.jpg",
    meta: "1600 × 900 · 184 KB",
  },
} satisfies Meta<typeof LibraryTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Current: Story = {
  args: { current: true },
};
