"use client";

import { Toaster } from "sonner";

export { useToast } from "@/stores/toast-store";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "!flex !items-center !gap-2.5 !rounded-md !border-0 !bg-neutral-900 !px-3.5 !py-3 !font-sans !text-sm !font-medium !text-text-inverse !shadow-lg",
          title: "!text-sm !font-medium !text-text-inverse",
          description: "!text-xs !text-neutral-400",
          success: "!bg-neutral-900 !text-text-inverse",
          error: "!bg-neutral-900 !text-text-inverse",
          actionButton:
            "!bg-transparent !px-0 !text-sm !font-semibold !text-brand-300",
        },
      }}
    />
  );
}
