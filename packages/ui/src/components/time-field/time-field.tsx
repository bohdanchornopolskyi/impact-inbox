"use client";

import { useState } from "react";
import { Clock3 } from "lucide-react";
import { TimePicker } from "../time-picker/time-picker";
import { PickerField } from "../../lib/picker-field";
import { PickerPopover } from "../../lib/picker-popover";

export type TimeFieldProps = {
  value: string;
  onValueChange?: (time: string) => void;
  times?: string[];
  className?: string;
  disabled?: boolean;
};

export function TimeField({
  value,
  onValueChange,
  times,
  className,
  disabled,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <PickerPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <PickerField
          icon={<Clock3 strokeWidth={1.5} />}
          className={className}
          disabled={disabled}
        >
          {value}
        </PickerField>
      }
    >
      <TimePicker
        value={value}
        times={times}
        onValueChange={(time) => {
          onValueChange?.(time);
          setOpen(false);
        }}
      />
    </PickerPopover>
  );
}
