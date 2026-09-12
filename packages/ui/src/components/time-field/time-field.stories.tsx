import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeField } from "./time-field";

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

export const Rest: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <TimeField {...args} value={value} onValueChange={setValue} />;
  },
};
