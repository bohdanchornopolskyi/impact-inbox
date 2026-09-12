import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Data/Badge",
  component: Badge,
  args: { children: "Neutral" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = { args: { tone: "success", children: "Success" } };
export const Warning: Story = { args: { tone: "warning", children: "Warning" } };
export const Danger: Story = { args: { tone: "danger", children: "Danger" } };
export const Info: Story = { args: { tone: "info", children: "Info" } };
export const Brand: Story = { args: { tone: "brand", children: "Brand" } };
export const Compact: Story = {
  args: { tone: "success", icon: false, children: "Sent" },
};
