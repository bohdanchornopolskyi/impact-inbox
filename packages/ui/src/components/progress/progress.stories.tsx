import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta = {
  title: "Data/Progress",
  component: Progress,
  args: {
    label: "Sending",
    valueLabel: "2,140 / 3,000",
    value: 2140,
    max: 3000,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
