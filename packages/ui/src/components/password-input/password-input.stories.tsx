import type { Meta, StoryObj } from "@storybook/react";
import { PasswordInput } from "./password-input";

const meta = {
  title: "Forms/PasswordInput",
  component: PasswordInput,
  args: {
    label: "Password",
    placeholder: "••••••••",
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: "Password must be at least 8 characters.",
  },
};
