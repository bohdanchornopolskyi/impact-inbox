import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Field } from "../../lib/field";
import { fieldControlClass } from "../../lib/field-control";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  disabled,
  ...props
}: TextareaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      {({ id: fieldId, describedBy, invalid }) => (
        <textarea
          id={fieldId}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldControlClass({ error: invalid, disabled, multiline: true }),
            "min-h-24 w-full resize-y px-3 py-2.5 text-sm leading-normal text-text outline-none placeholder:text-text-3 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
      )}
    </Field>
  );
}
