"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { DatePicker } from "../date-picker/date-picker";
import { formatPickerDate } from "../../lib/picker-date";
import { PickerField } from "../../lib/picker-field";
import { PickerPopover } from "../../lib/picker-popover";

export type DateFieldProps = {
  value: string;
  onValueChange?: (iso: string) => void;
  today?: string;
  minDate?: string;
  className?: string;
  disabled?: boolean;
};

export function DateField({
  value,
  onValueChange,
  today,
  minDate,
  className,
  disabled,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value.slice(0, 7));

  return (
    <PickerPopover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMonth(value.slice(0, 7));
      }}
      trigger={
        <PickerField
          icon={<Calendar strokeWidth={1.5} />}
          className={className}
          disabled={disabled}
        >
          {formatPickerDate(value)}
        </PickerField>
      }
    >
      <DatePicker
        month={month}
        value={value}
        today={today}
        minDate={minDate}
        onMonthChange={setMonth}
        onValueChange={(iso) => {
          onValueChange?.(iso);
          setMonth(iso.slice(0, 7));
          setOpen(false);
        }}
      />
    </PickerPopover>
  );
}
