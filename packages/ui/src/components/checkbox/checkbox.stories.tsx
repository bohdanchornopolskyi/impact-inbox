import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: {
    label: "Track clicks",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Checked: Story = {
  args: { label: "Track opens", defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Track clicks" />
      <Checkbox label="Track opens" defaultChecked />
      <Checkbox label="Track clicks" disabled />
    </div>
  ),
};
