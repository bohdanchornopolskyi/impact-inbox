import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateField } from "../date-field/date-field";
import { TimeField } from "../time-field/time-field";
import { TimezoneNote } from "../timezone-note/timezone-note";
import { SchedulePopover } from "./schedule-popover";

const meta = {
  title: "Pickers/Schedule Popover",
  component: SchedulePopover,
} satisfies Meta<typeof SchedulePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

function SchedulePopoverRest() {
  const [date, setDate] = useState("2026-03-18");
  const [time, setTime] = useState("09:30");
  return (
    <SchedulePopover
      timezone={
        <TimezoneNote>Sends {time} in Europe/Berlin (CET)</TimezoneNote>
      }
    >
      <DateField
        value={date}
        today="2026-03-12"
        onValueChange={setDate}
        className="min-w-0 flex-1"
      />
      <TimeField
        value={time}
        onValueChange={setTime}
        className="w-[124px] shrink-0"
      />
    </SchedulePopover>
  );
}

export const Rest: Story = {
  render: () => <SchedulePopoverRest />,
};
