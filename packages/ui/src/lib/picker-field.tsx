import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";
import { fieldControlClass } from "./field-control";

export type PickerFieldProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export function PickerField({
  icon,
  children,
  className,
  disabled,
  ref,
  ...props
}: PickerFieldProps) {
  return (
    <button
      type="button"
      ref={ref}
      disabled={disabled}
      className={cn(
        fieldControlClass({ disabled }),
        "h-control-lg w-full gap-2 px-3 text-left text-sm text-text",
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-icon-sm shrink-0 text-text-3 [&_svg]:size-full" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronDown className="size-icon-sm shrink-0 text-text-3" strokeWidth={1.5} />
    </button>
  );
}
