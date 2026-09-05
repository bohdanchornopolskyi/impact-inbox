import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Data/EmptyState",
  component: EmptyState,
  args: {
    title: "No campaigns yet",
    description: "Pick a template and send your first campaign in a few minutes.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    action: <Button variant="primary">New campaign</Button>,
  },
};
