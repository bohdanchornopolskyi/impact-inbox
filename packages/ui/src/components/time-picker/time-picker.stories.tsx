import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimePicker } from "./time-picker";

const meta = {
  title: "Pickers/Time Picker",
  component: TimePicker,
  args: {
    value: "09:30",
    times: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"],
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = {};
