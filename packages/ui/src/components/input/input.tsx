import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "../../lib/cn";
import { Field } from "../../lib/field";
import {
  fieldControlClass,
  fieldInputClass,
  hideNumberSpinnersClass,
} from "../../lib/field-control";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  labelAction?: ReactNode;
  leadingIcon?: ReactNode;
  suffix?: ReactNode;
  mono?: boolean;
  fieldClassName?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Input({
  label,
  hint,
  error,
  labelAction,
  leadingIcon,
  suffix,
  mono = false,
  className,
  fieldClassName,
  readOnly,
  disabled,
  id,
  type,
  spellCheck,
  ref,
  ...props
}: InputProps) {
  return (
    <Field id={id} label={label} labelAction={labelAction} hint={hint} error={error}>
      {({ id: fieldId, describedBy, invalid }) => (
        <div
          className={fieldControlClass({
            error: invalid,
            readOnly,
            disabled,
            className: fieldClassName,
          })}
        >
          {leadingIcon ? (
            <span className="flex pl-3 text-text-3 [&_svg]:size-icon-sm" aria-hidden>
              {leadingIcon}
            </span>
          ) : null}
          <input
            id={fieldId}
            ref={ref}
            type={type}
            readOnly={readOnly}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            spellCheck={
              type === "email" || type === "url" || type === "search"
                ? false
                : spellCheck
            }
            className={cn(
              fieldInputClass,
              mono && "font-mono tabular-nums",
              type === "number" && hideNumberSpinnersClass,
              className,
            )}
            {...props}
          />
          {suffix ? (
            <span className="flex items-center self-stretch border-l border-border px-2.5 font-mono text-xs text-text-3">
              {suffix}
            </span>
          ) : null}
        </div>
      )}
    </Field>
  );
}
