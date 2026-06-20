"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
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

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
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
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const field = (
    <div
      className={fieldControlClass({
        error: Boolean(error),
      })}
    >
      <input
        id={id}
        type={isVisible ? "text" : "password"}
        className={cn(fieldInputClass, className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="inline-flex items-center justify-center self-stretch px-toggle-x text-text-muted transition-colors hover:text-text-secondary"
      >
        <EyeIcon hidden={isVisible} />
      </button>
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
