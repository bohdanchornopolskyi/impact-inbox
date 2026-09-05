"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Button } from "../button/button";

type ClosePanelButtonProps = {
  className?: string;
  onClick?: () => void;
};

export function ClosePanelButton({ className, onClick }: ClosePanelButtonProps) {
  if (onClick) {
    return (
      <Button type="button" size="sm" className={className} onClick={onClick}>
        Close
      </Button>
    );
  }

  return (
    <BaseDialog.Close render={<Button type="button" size="sm" className={className} />}>
      Close
    </BaseDialog.Close>
  );
}
