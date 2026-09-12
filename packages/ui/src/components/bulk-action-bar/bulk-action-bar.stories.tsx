import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Download, Send, Tag, Trash2 } from "lucide-react";
import { BulkAction, BulkActionBar } from "./bulk-action-bar";

const meta = {
  title: "Data/Bulk Action Bar",
  component: BulkActionBar,
  args: {
    selectedLabel: "3 selected",
  },
} satisfies Meta<typeof BulkActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <BulkActionBar {...args}>
      <BulkAction icon={<Tag strokeWidth={1.5} />}>Tag</BulkAction>
      <BulkAction icon={<Send strokeWidth={1.5} />}>Resend</BulkAction>
      <BulkAction icon={<Copy strokeWidth={1.5} />}>Duplicate</BulkAction>
      <BulkAction icon={<Download strokeWidth={1.5} />}>Export</BulkAction>
      <BulkAction icon={<Trash2 strokeWidth={1.5} />} destructive>
        Delete
      </BulkAction>
    </BulkActionBar>
  ),
};
