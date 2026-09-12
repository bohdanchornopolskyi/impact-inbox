import { useId, type InputHTMLAttributes } from "react";
import { Crop, ImagePlus, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type ImageUploadProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "children" | "onChange" | "value"
> & {
  src?: string;
  alt?: string;
  title?: string;
  hint?: string;
  onFile?: (file: File) => void;
  onEdit?: () => void;
  onCrop?: () => void;
  onRemove?: () => void;
};

export function ImageUpload({
  src,
  alt = "",
  title = "Upload image",
  hint = "PNG or JPG up to 5 MB",
  accept = "image/png,image/jpeg",
  className,
  disabled,
  onFile,
  onEdit,
  onCrop,
  onRemove,
  ...props
}: ImageUploadProps) {
  const inputId = useId();

  if (src) {
    return (
      <div
        className={cn(
          "relative flex h-[148px] w-[216px] items-end justify-end overflow-hidden rounded-lg p-2 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.1)]",
          className,
        )}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="relative flex h-7 items-center gap-0.5 rounded-sm bg-neutral-900/[.72] px-1">
          {onEdit ? (
            <button
              type="button"
              aria-label="Edit image"
              className="relative inline-flex size-[22px] items-center justify-center text-white/85 before:absolute before:-inset-px [&_svg]:size-[13px]"
              onClick={onEdit}
            >
              <Pencil strokeWidth={1.5} />
            </button>
          ) : null}
          {onCrop ? (
            <button
              type="button"
              aria-label="Crop image"
              className="relative inline-flex size-[22px] items-center justify-center text-white/85 before:absolute before:-inset-px [&_svg]:size-[13px]"
              onClick={onCrop}
            >
              <Crop strokeWidth={1.5} />
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              aria-label="Remove image"
              className="relative inline-flex size-[22px] items-center justify-center text-white/85 before:absolute before:-inset-px [&_svg]:size-[13px]"
              onClick={onRemove}
            >
              <Trash2 strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex h-[148px] w-[216px] cursor-pointer flex-col items-center justify-center gap-1.25 rounded-lg border border-border-strong bg-bg text-center has-[:focus-visible]:shadow-[var(--shadow-ring-accent)]",
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
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile?.(file);
          event.target.value = "";
        }}
      />
      <span className="inline-flex size-5 text-text-3 [&_svg]:size-full" aria-hidden>
        <ImagePlus strokeWidth={1.5} />
      </span>
      <span className="text-sm font-medium text-text-2">{title}</span>
      <span className="text-2xs text-text-3">{hint}</span>
    </label>
  );
}
