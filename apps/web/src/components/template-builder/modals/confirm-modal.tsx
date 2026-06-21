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
  children?: ReactNode;
};

/**
 * Reusable confirm dialog built on the shared Modal primitive. The archive /
 * restore / restore-revision modals are thin configs over this component.
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = "primary",
  onConfirm,
  isPending,
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
            Cancel
          </Button>
          <Button
            variant={variant}
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
