import type { Meta, StoryObj } from "@storybook/react-vite";
import { UnitField } from "./unit-field";

const meta = {
  title: "Editor/Unit Field",
  component: UnitField,
  args: {
    defaultValue: 12,
    unit: "px",
  },
} satisfies Meta<typeof UnitField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pixels: Story = {};

export const Percent: Story = {
  args: { defaultValue: 50, unit: "%" },
};
