import type { ReactNode } from "react";
import { Button } from "../button/button";
import { cn } from "../../lib/cn";

export type SchedulePopoverProps = {
  title?: string;
  timezone?: ReactNode;
  children: ReactNode;
  cancelLabel?: string;
  scheduleLabel?: string;
  onCancel?: () => void;
  onSchedule?: () => void;
  className?: string;
};

export function SchedulePopover({
  title = "Schedule send",
  timezone,
  children,
  cancelLabel = "Cancel",
  scheduleLabel = "Schedule",
  onCancel,
  onSchedule,
  className,
}: SchedulePopoverProps) {
  return (
    <div
      className={cn(
        "flex w-[352px] flex-col gap-4 rounded-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <p className="text-md font-semibold text-text">{title}</p>
      <div className="flex gap-2">{children}</div>
      {timezone}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={onSchedule}>
          {scheduleLabel}
        </Button>
      </div>
    </div>
  );
}
