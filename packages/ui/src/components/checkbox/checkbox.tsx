import type { InputHTMLAttributes, Ref } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  checkboxBoxMarkClass,
  checkboxMarkClass,
  choiceInputClass,
  choiceRootClass,
} from "../../lib/choice-control";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  indeterminate?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({
  label,
  className,
  disabled,
  indeterminate = false,
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
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (node) {
            node.indeterminate = indeterminate;
          }
        }}
        type="checkbox"
        disabled={disabled}
        className={choiceInputClass}
      />
      <span
        className={label ? checkboxMarkClass : checkboxBoxMarkClass}
        data-indeterminate={indeterminate || undefined}
      >
        <Check className="check size-3 text-text-inverse" strokeWidth={1.5} aria-hidden />
        <Minus
          className="minus absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-text-inverse"
          strokeWidth={1.5}
          aria-hidden
        />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
