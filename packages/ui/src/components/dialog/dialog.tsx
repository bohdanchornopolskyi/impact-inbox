"use client";

import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "../../lib/cn";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  leading?: ReactNode;
  className?: string;
};

function DismissIcon() {
  return (
    <svg viewBox="0 0 13 13" fill="none" aria-hidden>
      <path
        d="M3 3l7 7M10 3l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  leading,
  className,
}: ModalProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-overlay transition-[opacity] duration-150 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Viewport className="fixed inset-0 flex items-center justify-center p-4">
          <BaseDialog.Popup
            className={cn(
              "relative w-full max-w-120 overflow-hidden rounded-xl bg-surface shadow-lg outline-none overscroll-contain transition-[opacity,translate] duration-150 ease-out data-[ending-style]:translate-y-1 data-[starting-style]:translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
              className,
            )}
          >
            <div className="flex items-start gap-3 px-6 pt-6">
              {leading ? (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-danger-50 text-danger [&_svg]:size-5">
                  {leading}
                </div>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <BaseDialog.Title className="text-xl font-semibold text-text">
                  {title}
                </BaseDialog.Title>
                {description ? (
                  <BaseDialog.Description className="text-sm text-text-2">
                    {description}
                  </BaseDialog.Description>
                ) : null}
              </div>
              <BaseDialog.Close
                aria-label="Close"
                className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-text-3 transition-[background-color] duration-150 ease-out before:absolute before:-inset-0.5 hover:bg-surface-sunken"
              >
                <DismissIcon />
              </BaseDialog.Close>
            </div>
            {children ? (
              <div className="px-6 py-5">{children}</div>
            ) : null}
            {footer ? (
              <div className="flex justify-end gap-2.5 border-t border-border bg-neutral-50 px-6 py-4">
                {footer}
              </div>
            ) : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export { BaseDialog as Dialog };
