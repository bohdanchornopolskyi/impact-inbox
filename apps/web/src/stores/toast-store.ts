import { toast } from "sonner";

type ToastVariant = "success" | "error";

export function showToast(message: string, variant: ToastVariant = "success") {
  if (variant === "error") {
    toast.error(message);
    return;
  }

  toast.success(message);
}

export function showError(message: string) {
  toast.error(message);
}

// Thin hook kept for call-site compatibility: the return shape is identical to
// the previous zustand-backed implementation, so consumers need no change.
export function useToast() {
  return { showToast, showError };
}
