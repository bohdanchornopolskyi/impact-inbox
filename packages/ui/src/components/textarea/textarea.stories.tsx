import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  args: {
    label: "Preheader",
    placeholder: "Shown in the inbox next to the subject",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: "Preheader is too long.",
    defaultValue: "A very long preview line that exceeds the limit.",
  },
};
