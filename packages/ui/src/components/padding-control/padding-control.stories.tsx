import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PaddingControl, type PaddingSides } from "./padding-control";

const linked: PaddingSides = { top: 12, right: 16, bottom: 12, left: 16 };
const unlinked: PaddingSides = { top: 24, right: 16, bottom: 8, left: 16 };

const meta = {
  title: "Editor/Padding Control",
  component: PaddingControl,
} satisfies Meta<typeof PaddingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Linked: Story = {
  args: { value: linked, linked: true },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [isLinked, setLinked] = useState(args.linked ?? true);
    return (
      <PaddingControl
        value={value}
        linked={isLinked}
        onChange={setValue}
        onLinkedChange={setLinked}
      />
    );
  },
};

export const Unlinked: Story = {
  args: { value: unlinked, linked: false },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [isLinked, setLinked] = useState(args.linked ?? false);
    return (
      <PaddingControl
        value={value}
        linked={isLinked}
        onChange={setValue}
        onLinkedChange={setLinked}
      />
    );
  },
};
