import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormError } from "./form-error";

const meta = {
  title: "Forms/FormError",
  component: FormError,
  args: {
    message: "Invalid email or password.",
  },
} satisfies Meta<typeof FormError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDetails: Story = {
  args: {
    details: "Check Caps Lock and try again.",
  },
};
