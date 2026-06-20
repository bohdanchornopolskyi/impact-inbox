"use client";

import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "../../lib/cn";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-neutral-900/35 transition-opacity duration-180 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Viewport className="fixed inset-0 flex items-center justify-center p-4">
          <BaseDialog.Popup
            className={cn(
              "relative w-full max-w-lg rounded-xl border border-border-default bg-surface-card p-6 shadow-pop outline-none data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
              className,
            )}
          >
            <BaseDialog.Title className="text-ui-xl font-semibold text-text-primary">
              {title}
            </BaseDialog.Title>
            {description ? (
              <BaseDialog.Description className="mt-2 text-ui-sm text-text-secondary">
                {description}
              </BaseDialog.Description>
            ) : null}
            <div className="mt-5">{children}</div>
            {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
            <BaseDialog.Close className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text-secondary">
              <span className="sr-only">Close</span>
              ×
            </BaseDialog.Close>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export { BaseDialog as Dialog };
