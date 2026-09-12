import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type SaveBarProps = HTMLAttributes<HTMLDivElement> & {
  status: ReactNode;
  onDiscard?: () => void;
  onSave?: () => void;
  discardLabel?: string;
  saveLabel?: string;
  discardDisabled?: boolean;
  saveDisabled?: boolean;
};

export function SaveBar({
  status,
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
        "flex h-16 items-center justify-between border border-border bg-surface px-6",
        className,
      )}
      {...props}
    >
      {status}
      <div className="flex items-center gap-2.5">
        <Button variant="secondary" disabled={discardDisabled} onClick={onDiscard}>
          {discardLabel}
        </Button>
        <Button variant="primary" disabled={saveDisabled} onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
