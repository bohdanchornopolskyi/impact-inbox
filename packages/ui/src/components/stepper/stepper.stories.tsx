import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper, type StepperProps } from "./stepper";

const meta = {
  title: "Editor/Stepper",
  component: Stepper,
  args: {
    value: 400,
    min: 1,
    max: 700,
    step: 10,
    unit: "px",
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function StepperPreview(args: StepperProps) {
  const [value, setValue] = useState(args.value);
  return <Stepper {...args} value={value} onValueChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <StepperPreview {...args} />,
};
