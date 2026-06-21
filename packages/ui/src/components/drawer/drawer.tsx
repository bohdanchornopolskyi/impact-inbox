"use client";

import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { ClosePanelButton } from "../close-panel-button/close-panel-button";
import { cn } from "../../lib/cn";

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DrawerProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-neutral-900/20 transition-opacity duration-180 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Viewport className="fixed inset-0 flex items-stretch justify-end p-0">
          <BaseDialog.Popup
            className={cn(
              "flex h-full w-full max-w-md flex-col border-l border-border-default bg-surface-card shadow-drawer outline-none data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
              className,
            )}
          >
            <div className="border-b border-border-default px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <BaseDialog.Title className="text-ui-lg font-semibold text-text-primary">
                    {title}
                  </BaseDialog.Title>
                  {description ? (
                    <BaseDialog.Description className="mt-1 text-ui-sm text-text-secondary">
                      {description}
                    </BaseDialog.Description>
                  ) : null}
                </div>
                <ClosePanelButton />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="border-t border-border-default px-5 py-4">{footer}</div>
            ) : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
