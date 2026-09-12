import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DeviceToggle } from "./device-toggle";

const meta = {
  title: "Editor/Device Toggle",
  component: DeviceToggle,
} satisfies Meta<typeof DeviceToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "desktop",
    onChange: () => undefined,
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <DeviceToggle {...args} value={value} onChange={setValue} />;
  },
};

export const Mobile: Story = {
  args: {
    value: "mobile",
    onChange: () => undefined,
  },
};
