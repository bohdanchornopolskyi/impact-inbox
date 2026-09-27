import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeField, type TimeFieldProps } from "./time-field";

const meta = {
  title: "Pickers/Time Field",
  component: TimeField,
  args: {
    value: "09:30",
    className: "w-[190px]",
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

function TimeFieldPreview(args: TimeFieldProps) {
  const [value, setValue] = useState(args.value);
  return <TimeField {...args} value={value} onValueChange={setValue} />;
}

export const Rest: Story = {
  render: (args) => <TimeFieldPreview {...args} />,
};
