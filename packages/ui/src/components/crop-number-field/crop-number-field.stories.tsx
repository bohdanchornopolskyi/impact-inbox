import type { Meta, StoryObj } from "@storybook/react-vite";
import { CropNumberField } from "./crop-number-field";

const meta = {
  title: "Editor/Crop Number Field",
  component: CropNumberField,
  args: {
    prefix: "W",
    defaultValue: 1200,
  },
} satisfies Meta<typeof CropNumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
