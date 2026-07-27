"use client";

import type { ReactNode } from "react";
import { Button, Modal } from "@repo/ui/client";

export type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  variant?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
  isPending: boolean;
  confirmDisabled?: boolean;
  hideConfirm?: boolean;
  cancelLabel?: string;
  children?: ReactNode;
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = "primary",
  onConfirm,
  isPending,
  confirmDisabled = false,
  hideConfirm = false,
  cancelLabel = "Cancel",
  children,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          {hideConfirm ? null : (
            <Button
              variant={variant}
              disabled={isPending || confirmDisabled}
              onClick={() => void onConfirm()}
            >
              {confirmLabel}
            </Button>
          )}
        </>
      }
    >
      {children}
    </Modal>
  );
}
