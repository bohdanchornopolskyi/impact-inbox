import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  fieldControlClass,
  fieldErrorClass,
  fieldHintClass,
  fieldInputClass,
  fieldLabelClass,
  fieldLabelRowClass,
  fieldRootClass,
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
  id,
  ...props
}: InputProps) {
  const field = (
    <div
      className={fieldControlClass({
        error: Boolean(error),
        readOnly,
        className: fieldClassName,
      })}
    >
      {leadingIcon ? (
        <span className="flex pl-2.5 text-text-muted">{leadingIcon}</span>
      ) : null}
      <input
        id={id}
        readOnly={readOnly}
        className={cn(
          fieldInputClass,
          mono && "font-mono text-ui-base",
          className,
        )}
        {...props}
      />
      {suffix ? (
        <span className="flex items-center self-stretch border-l border-border-subtle px-2.5 font-mono text-ui-xs text-text-muted">
          {suffix}
        </span>
      ) : null}
    </div>
  );

  if (!label) {
    return (
      <div className="block">
        {field}
        {hint ? <p className={fieldHintClass}>{hint}</p> : null}
        {error ? <p className={fieldErrorClass}>{error}</p> : null}
      </div>
    );
  }

  return (
    <label className={fieldRootClass} htmlFor={id}>
      <div className={fieldLabelRowClass}>
        <span className={fieldLabelClass}>{label}</span>
        {labelAction}
      </div>
      {field}
      {hint ? <p className={fieldHintClass}>{hint}</p> : null}
      {error ? <p className={fieldErrorClass}>{error}</p> : null}
    </label>
  );
}
