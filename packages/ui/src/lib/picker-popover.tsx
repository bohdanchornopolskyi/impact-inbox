"use client";

import type { ReactElement, ReactNode } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

export function PickerPopover({
  open,
  onOpenChange,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
  children: ReactNode;
}) {
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner align="start" sideOffset={6}>
          <BasePopover.Popup className="z-50 outline-none">{children}</BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
