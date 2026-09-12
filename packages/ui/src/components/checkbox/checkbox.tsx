import type { InputHTMLAttributes, Ref } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  checkboxMarkClass,
  choiceInputClass,
  choiceRootClass,
} from "../../lib/choice-control";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({
  label,
  className,
  disabled,
  ref,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        choiceRootClass,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        {...props}
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className={choiceInputClass}
      />
      <span className={checkboxMarkClass}>
        <Check className="size-3 text-text-inverse" strokeWidth={1.5} aria-hidden />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
