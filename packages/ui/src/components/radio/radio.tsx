import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "../../lib/cn";
import {
  choiceInputClass,
  choiceRootClass,
  radioMarkClass,
} from "../../lib/choice-control";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Radio({
  label,
  className,
  disabled,
  ref,
  ...props
}: RadioProps) {
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
        type="radio"
        disabled={disabled}
        className={choiceInputClass}
      />
      <span className={radioMarkClass} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
