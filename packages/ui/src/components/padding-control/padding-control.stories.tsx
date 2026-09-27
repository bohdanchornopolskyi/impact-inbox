import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PaddingControl,
  type PaddingControlProps,
  type PaddingSides,
} from "./padding-control";

const paired: PaddingSides = { top: 12, right: 16, bottom: 12, left: 16 };
const sides: PaddingSides = { top: 12, right: 16, bottom: 12, left: 16 };
const mixed: PaddingSides = { top: 24, right: 16, bottom: 8, left: 16 };

const meta = {
  title: "Editor/Padding Control",
  component: PaddingControl,
} satisfies Meta<typeof PaddingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function PaddingPreview({
  value: initialValue,
  eachSide: initialEachSide = false,
}: PaddingControlProps) {
  const [value, setValue] = useState(initialValue);
  const [eachSide, setEachSide] = useState(initialEachSide);
  return (
    <div className="w-[308px]">
      <PaddingControl
        value={value}
        eachSide={eachSide}
        onChange={setValue}
        onEachSideChange={setEachSide}
      />
    </div>
  );
}

export const Paired: Story = {
  args: { value: paired },
  render: (args) => <PaddingPreview {...args} />,
};

export const EachSide: Story = {
  args: { value: sides, eachSide: true },
  render: (args) => <PaddingPreview {...args} />,
};

export const Mixed: Story = {
  args: { value: mixed },
  render: (args) => <PaddingPreview {...args} />,
};
