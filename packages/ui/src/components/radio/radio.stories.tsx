import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "./radio";

const meta = {
  title: "Forms/Radio",
  component: Radio,
  args: {
    label: "Send now",
    name: "send-when",
    value: "now",
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Radio name="schedule" value="later" label="Send later" />
      <Radio name="schedule" value="now" label="Send now" defaultChecked />
      <Radio name="schedule-disabled" value="now" label="Send now" disabled />
    </div>
  ),
};
