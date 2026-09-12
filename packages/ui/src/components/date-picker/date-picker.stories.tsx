import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./date-picker";
import { CalendarDay } from "./calendar-day";

const meta = {
  title: "Pickers/Date Picker",
  component: DatePicker,
  args: {
    month: "2026-03",
    value: "2026-03-18",
    today: "2026-03-12",
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const March: Story = {};

export const WithMinDate: Story = {
  args: {
    minDate: "2026-03-12",
  },
};

export const DayStates: Story = {
  render: () => (
    <div className="flex w-[38px] flex-col gap-3">
      <CalendarDay>18</CalendarDay>
      <CalendarDay className="bg-surface-sunken">18</CalendarDay>
      <CalendarDay today>18</CalendarDay>
      <CalendarDay selected>18</CalendarDay>
      <CalendarDay inRange>18</CalendarDay>
      <CalendarDay disabled>18</CalendarDay>
    </div>
  ),
};
