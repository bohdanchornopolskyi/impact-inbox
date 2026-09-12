import type { Meta, StoryObj } from "@storybook/react-vite";
import { CropPreviewTile } from "./crop-preview-tile";

const meta = {
  title: "Editor/Crop Preview Tile",
  component: CropPreviewTile,
  args: { label: "16:9" },
} satisfies Meta<typeof CropPreviewTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
