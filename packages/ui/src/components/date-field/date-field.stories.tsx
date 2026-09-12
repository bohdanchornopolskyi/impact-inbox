import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateField } from "./date-field";

const meta = {
  title: "Pickers/Date Field",
  component: DateField,
  args: {
    value: "2026-03-18",
    today: "2026-03-12",
    className: "w-[240px]",
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <DateField {...args} value={value} onValueChange={setValue} />;
  },
};
