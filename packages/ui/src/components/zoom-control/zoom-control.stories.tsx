import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ZoomControl, ZOOM_DEFAULT } from "./zoom-control";

const meta = {
  title: "Editor/ZoomControl",
  component: ZoomControl,
} satisfies Meta<typeof ZoomControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: ZOOM_DEFAULT, onChange: () => undefined },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <ZoomControl {...args} value={value} onChange={setValue} />;
  },
};
