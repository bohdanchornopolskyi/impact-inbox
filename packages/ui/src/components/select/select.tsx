import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Field } from "../../lib/field";
import {
  fieldControlClass,
  fieldInputClass,
} from "../../lib/field-control";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-full">
      <path
        d="M4 6.5 L8 10.5 L12 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  id,
  disabled,
  ...props
}: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      {({ id: fieldId, describedBy, invalid }) => (
        <div
          className={cn(
            fieldControlClass({ error: invalid, disabled }),
            "relative",
          )}
        >
          <select
            id={fieldId}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              fieldInputClass,
              "appearance-none pr-8",
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 size-icon-sm text-text-3">
            <ChevronIcon />
          </span>
        </div>
      )}
    </Field>
  );
}
