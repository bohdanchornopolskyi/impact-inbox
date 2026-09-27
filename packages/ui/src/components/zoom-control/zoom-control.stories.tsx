import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ZoomControl,
  ZOOM_DEFAULT,
  type ZoomControlProps,
} from "./zoom-control";

const meta = {
  title: "Editor/ZoomControl",
  component: ZoomControl,
} satisfies Meta<typeof ZoomControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function ZoomControlPreview(args: ZoomControlProps) {
  const [value, setValue] = useState(args.value);
  return <ZoomControl {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
  args: { value: ZOOM_DEFAULT, onChange: () => undefined },
  render: (args) => <ZoomControlPreview {...args} />,
};
