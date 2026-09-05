import { useId, type ReactNode } from "react";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  fieldLabelRowClass,
  fieldRootClass,
} from "./field-control";

export type FieldRenderProps = {
  id: string;
  describedBy?: string;
  invalid: boolean;
};

export function Field({
  id,
  label,
  labelAction,
  hint,
  error,
  children,
}: {
  id?: string;
  label?: string;
  labelAction?: ReactNode;
  hint?: string;
  error?: string;
  children: (field: FieldRenderProps) => ReactNode;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={label ? fieldRootClass : "block"}>
      {label ? (
        <div className={fieldLabelRowClass}>
          <label htmlFor={fieldId} className={fieldLabelClass}>
            {label}
          </label>
          {labelAction}
        </div>
      ) : null}
      {children({
        id: fieldId,
        describedBy,
        invalid: Boolean(error),
      })}
      {hint ? (
        <p id={hintId} className={fieldHintClass}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
