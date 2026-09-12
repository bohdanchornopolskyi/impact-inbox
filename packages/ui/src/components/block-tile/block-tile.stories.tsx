import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "lucide-react";
import { BlockTile } from "./block-tile";

const meta = {
  title: "Editor/Block Tile",
  component: BlockTile,
  args: {
    label: "Heading",
    icon: <Heading strokeWidth={1.5} />,
  },
} satisfies Meta<typeof BlockTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Grabbed: Story = {
  args: { grabbed: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
