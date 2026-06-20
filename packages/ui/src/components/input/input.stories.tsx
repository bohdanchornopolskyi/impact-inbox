import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta = {
  title: "Forms/Input",
  component: Input,
  args: {
    label: "Email",
    placeholder: "you@company.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: {
    label: "Password",
    type: "password",
    hint: "8-24 characters with upper, lower, number, and special character.",
  },
};

export const WithError: Story = {
  args: {
    error: "Enter a valid email address.",
    defaultValue: "not-an-email",
  },
};

export const WithSuffix: Story = {
  args: {
    label: "Width",
    defaultValue: "600",
    suffix: "px",
    mono: true,
  },
};
