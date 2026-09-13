import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type SaveBarProps = HTMLAttributes<HTMLDivElement> & {
  status: ReactNode;
  form?: string;
  onDiscard?: () => void;
  onSave?: () => void;
  discardLabel?: string;
  saveLabel?: string;
  discardDisabled?: boolean;
  saveDisabled?: boolean;
};

export function SaveBar({
  status,
  form,
  onDiscard,
  onSave,
  discardLabel = "Discard",
  saveLabel = "Save changes",
  discardDisabled,
  saveDisabled,
  className,
  ...props
}: SaveBarProps) {
  return (
    <div
      className={cn(
        "flex h-16 w-full items-center justify-between gap-4",
        className,
      )}
      {...props}
    >
      {status}
      <div className="flex items-center gap-2.5">
        <Button
          type={form ? "reset" : "button"}
          form={form}
          variant="secondary"
          disabled={discardDisabled}
          onClick={onDiscard}
        >
          {discardLabel}
        </Button>
        <Button
          type={form ? "submit" : "button"}
          form={form}
          variant="primary"
          disabled={saveDisabled}
          onClick={onSave}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
