import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
  title: "Forms/Button",
  component: Button,
  args: {
    children: "Save changes",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Soft: Story = {
  args: { variant: "soft" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete workspace" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { variant: "primary", fullWidth: true, children: "Sign in" },
};
