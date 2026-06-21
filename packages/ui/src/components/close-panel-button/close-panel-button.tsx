"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "../../lib/cn";

const closePanelButtonClassName =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm border border-border-strong bg-surface-card px-2.5 py-1.5 text-ui-sm font-medium text-text-secondary transition-[background,border-color,color] duration-120 hover:bg-surface-muted";

type ClosePanelButtonProps = {
  className?: string;
  onClick?: () => void;
};

export function ClosePanelButton({ className, onClick }: ClosePanelButtonProps) {
  const classes = cn(closePanelButtonClassName, className);

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        Close
      </button>
    );
  }

  return <BaseDialog.Close className={classes}>Close</BaseDialog.Close>;
}
