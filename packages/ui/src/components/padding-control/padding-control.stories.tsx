import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PaddingControl, type PaddingSides } from "./padding-control";

const paired: PaddingSides = { top: 12, right: 16, bottom: 12, left: 16 };
const sides: PaddingSides = { top: 12, right: 16, bottom: 12, left: 16 };
const mixed: PaddingSides = { top: 24, right: 16, bottom: 8, left: 16 };

const meta = {
  title: "Editor/Padding Control",
  component: PaddingControl,
} satisfies Meta<typeof PaddingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paired: Story = {
  args: { value: paired },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [eachSide, setEachSide] = useState(false);
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
  },
};

export const EachSide: Story = {
  args: { value: sides, eachSide: true },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [eachSide, setEachSide] = useState(true);
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
  },
};

export const Mixed: Story = {
  args: { value: mixed },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [eachSide, setEachSide] = useState(false);
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
  },
};
