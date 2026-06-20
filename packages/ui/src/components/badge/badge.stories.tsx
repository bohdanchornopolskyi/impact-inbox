import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta = {
  title: "Feedback/Badge",
  component: Badge,
  args: { children: "Draft" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = { args: { tone: "success", children: "Sent" } };
export const Warning: Story = {
  args: { tone: "warning", children: "Scheduled" },
};
export const Danger: Story = { args: { tone: "danger", children: "Failed" } };
export const WithDot: Story = {
  args: { tone: "info", dot: true, children: "Sending" },
};
