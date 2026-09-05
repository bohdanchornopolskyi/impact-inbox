import type { Meta, StoryObj } from "@storybook/react";
import { DropdownMenu } from "./dropdown-menu";

const meta = {
  title: "Overlays/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: "Open menu",
    items: [
      { label: "Rename", onSelect: () => undefined },
      { label: "Duplicate", onSelect: () => undefined },
      {
        label: "Move to folder",
        onSelect: () => undefined,
        disabled: true,
      },
      {
        label: "Delete",
        onSelect: () => undefined,
        destructive: true,
        separatorBefore: true,
      },
    ],
  },
};
