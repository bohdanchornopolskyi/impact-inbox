import type { ButtonHTMLAttributes } from "react";
import { Check, FileCheck2, FileText, FileX, RotateCcw, X } from "lucide-react";
import { cn } from "../../lib/cn";

export type UploadRowStatus = "uploading" | "done" | "failed";

export type UploadRowProps = {
  fileName: string;
  meta: string;
  progress: number;
  status?: UploadRowStatus;
  onDismiss?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onRetry?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
};

const chipClass: Record<UploadRowStatus, string> = {
  uploading: "bg-surface-sunken text-text-2",
  done: "bg-success-50 text-success-700",
  failed: "bg-danger-50 text-danger-700",
};

const fillClass: Record<UploadRowStatus, string> = {
  uploading: "bg-accent",
  done: "bg-success",
  failed: "bg-danger",
};

const FileIcon = {
  uploading: FileText,
  done: FileCheck2,
  failed: FileX,
};

export function UploadRow({
  fileName,
  meta,
  progress,
  status = "uploading",
  onDismiss,
  onRetry,
  className,
}: UploadRowProps) {
  const Icon = FileIcon[status];
  const ratio = Math.min(1, Math.max(0, progress / 100));

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sm border border-border bg-surface p-3",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-sm [&_svg]:size-4",
          chipClass[status],
        )}
        aria-hidden
      >
        <Icon strokeWidth={1.5} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-text">{fileName}</p>
          <p
            className={cn(
              "shrink-0 text-xs tabular-nums",
              status === "failed" ? "text-danger-700" : "text-text-3",
            )}
          >
            {meta}
          </p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
          role="progressbar"
          aria-label={fileName}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-150 ease-out",
              fillClass[status],
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
      {status === "done" ? (
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center text-success-700 [&_svg]:size-icon-sm"
          aria-hidden
        >
          <Check strokeWidth={1.5} />
        </span>
      ) : (
        <button
          type="button"
          aria-label={status === "failed" ? "Retry upload" : "Cancel upload"}
          className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-xs text-text-3 transition-[background-color] duration-150 ease-out before:absolute before:-inset-0.5 hover:bg-surface-sunken [&_svg]:size-icon-sm"
          onClick={status === "failed" ? onRetry : onDismiss}
        >
          {status === "failed" ? (
            <RotateCcw strokeWidth={1.5} />
          ) : (
            <X strokeWidth={1.5} />
          )}
        </button>
      )}
    </div>
  );
}
