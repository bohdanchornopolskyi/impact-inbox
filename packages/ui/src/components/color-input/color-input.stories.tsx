import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorInput } from "./color-input";

const meta = {
  title: "Editor/Color Input",
  component: ColorInput,
  args: {
    hex: "#4F46E5",
    alpha: 1,
  },
} satisfies Meta<typeof ColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const White: Story = {
  args: { hex: "#ffffff" },
};

export const Transparent: Story = {
  args: { hex: "#0F172A", alpha: 0.4 },
};
