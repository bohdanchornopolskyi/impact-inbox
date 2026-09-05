"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Field } from "../../lib/field";
import {
  fieldControlClass,
  fieldInputClass,
} from "../../lib/field-control";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-full">
      <path
        d="M2.5 10 C4.5 5.5 8 4 10 4 C12 4 15.5 5.5 17.5 10 C15.5 14.5 12 16 10 16 C8 16 4.5 14.5 2.5 10 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      {hidden ? (
        <path
          d="M4 4 L16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  hint?: string;
  error?: string;
  labelAction?: ReactNode;
};

export function PasswordInput({
  label,
  hint,
  error,
  labelAction,
  className,
  id,
  disabled,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field id={id} label={label} labelAction={labelAction} hint={hint} error={error}>
      {({ id: fieldId, describedBy, invalid }) => (
        <div
          className={fieldControlClass({
            error: invalid,
            disabled,
          })}
        >
          <input
            id={fieldId}
            type={isVisible ? "text" : "password"}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            spellCheck={false}
            className={cn(fieldInputClass, className)}
            {...props}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="inline-flex size-control-sm shrink-0 items-center justify-center text-text-3 transition-colors duration-150 hover:text-text-2 disabled:text-text-3"
          >
            <span className="size-icon-md">
              <EyeIcon hidden={isVisible} />
            </span>
          </button>
        </div>
      )}
    </Field>
  );
}
