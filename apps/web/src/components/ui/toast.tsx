"use client";

import { Toaster } from "sonner";

export { useToast } from "@/stores/toast-store";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border shadow-lg !font-sans text-ui-sm !bg-surface-card",
          title: "text-text-primary font-medium",
          description: "text-text-secondary",
          success: "!border-border-default !text-text-primary",
          error:
            "!border-status-danger-fg/20 !bg-status-danger-bg !text-status-danger-fg",
          closeButton:
            "!border-border-strong !bg-surface-card !text-text-secondary hover:!bg-surface-muted",
        },
      }}
    />
  );
}
