import { useId, type DragEvent, type InputHTMLAttributes } from "react";
import { Download, FileX, FolderOpen, Upload } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

export type DropzoneStatus = "idle" | "dragOver" | "rejected";

export type DropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "children" | "onChange"
> & {
  status?: DropzoneStatus;
  title?: string;
  description?: string;
  hint?: string;
  browseLabel?: string;
  dragTitle?: string;
  dragDescription?: string;
  onFile?: (file: File) => void;
};

function bumpDrag(el: HTMLElement, delta: number) {
  const next = Math.max(0, Number(el.dataset.dragCount ?? 0) + delta);
  if (next === 0) {
    delete el.dataset.dragCount;
    delete el.dataset.drag;
    return;
  }
  el.dataset.dragCount = String(next);
  el.dataset.drag = "";
}

export function Dropzone({
  status = "idle",
  title = "Drop your CSV here",
  description = "Needs an email column. First name, last name and tags are optional.",
  hint = "CSV or TSV up to 10 MB",
  browseLabel = "Browse files",
  dragTitle = "Drop to upload",
  dragDescription = "Release the file to start the import.",
  accept = ".csv,.tsv,text/csv,text/tab-separated-values",
  className,
  disabled,
  onFile,
  ...props
}: DropzoneProps) {
  const inputId = useId();
  const titleId = useId();
  const descId = useId();

  const openPicker = () => {
    if (disabled) return;
    document.getElementById(inputId)?.click();
  };

  const takeFile = (file: File | undefined) => {
    if (!file || disabled) return;
    onFile?.(file);
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    bumpDrag(event.currentTarget, 1);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    bumpDrag(event.currentTarget, -1);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? "none" : "copy";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    delete event.currentTarget.dataset.dragCount;
    delete event.currentTarget.dataset.drag;
    takeFile(event.dataTransfer.files[0]);
  };

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-describedby={descId}
      aria-invalid={status === "rejected" || undefined}
      data-status={status}
      onClick={openPicker}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group flex h-[212px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border bg-bg px-6 text-center transition-[background-color,border-color] duration-150 ease-out",
        status === "rejected"
          ? "border-danger bg-danger-50"
          : status === "dragOver"
            ? "border-2 border-accent bg-accent-soft"
            : "border-border-strong",
        "data-[drag]:border-2 data-[drag]:border-accent data-[drag]:bg-accent-soft",
        disabled && "pointer-events-none cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        {...props}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          takeFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-lg border bg-surface [&_svg]:size-5",
          status === "rejected"
            ? "border-danger-200 text-danger group-data-[drag]:border-brand-200 group-data-[drag]:text-accent"
            : status === "dragOver"
              ? "border-brand-200 text-accent"
              : "border-border text-text-3 group-data-[drag]:border-brand-200 group-data-[drag]:text-accent",
        )}
        aria-hidden
      >
        <span className={status === "dragOver" ? "hidden" : "group-data-[drag]:hidden"}>
          {status === "rejected" ? (
            <FileX strokeWidth={1.5} />
          ) : (
            <Upload strokeWidth={1.5} />
          )}
        </span>
        <span className={status === "dragOver" ? "contents" : "hidden group-data-[drag]:contents"}>
          <Download strokeWidth={1.5} />
        </span>
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <p
          id={titleId}
          className={cn(
            "text-md font-semibold text-pretty",
            status === "rejected"
              ? "text-danger-700 group-data-[drag]:text-brand-700"
              : status === "dragOver"
                ? "text-brand-700"
                : "text-text group-data-[drag]:text-brand-700",
          )}
        >
          <span className={status === "dragOver" ? "hidden" : "group-data-[drag]:hidden"}>
            {title}
          </span>
          <span className={status === "dragOver" ? "contents" : "hidden group-data-[drag]:contents"}>
            {dragTitle}
          </span>
        </p>
        <p
          id={descId}
          className={cn(
            "text-sm text-pretty",
            status === "dragOver"
              ? "text-brand-600"
              : "text-text-2 group-data-[drag]:text-brand-600",
          )}
        >
          <span className={status === "dragOver" ? "hidden" : "group-data-[drag]:hidden"}>
            {description}
          </span>
          <span className={status === "dragOver" ? "contents" : "hidden group-data-[drag]:contents"}>
            {dragDescription}
          </span>
        </p>
      </div>
      <div className="pt-2">
        <Button
          type="button"
          variant="secondary"
          leftIcon={<FolderOpen strokeWidth={1.5} />}
          onClick={(event) => {
            event.stopPropagation();
            openPicker();
          }}
        >
          {browseLabel}
        </Button>
      </div>
      <p className="text-xs text-text-3">{hint}</p>
    </div>
  );
}
