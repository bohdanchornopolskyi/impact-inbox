"use client";

import type { ReactNode, Ref } from "react";
import { Input } from "@repo/ui/client";
import { ColorPickerField } from "./color-picker-field";

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-ui-xs font-medium text-text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  onFocus,
  inputRef,
  placeholder,
  multiline = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  /** Single-line only — lets callers read the caret position (merge-tag insert). */
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-ui-sm text-text-primary outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <Input
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldRow>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      <Input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === "" ? undefined : Number(next));
        }}
      />
    </FieldRow>
  );
}

export function ColorField({
  label,
  value,
  fallback,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string | undefined;
  fallback?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <ColorPickerField
      label={label}
      value={value}
      fallback={fallback}
      disabled={disabled}
      onChange={onChange}
    />
  );
}

export function UrlField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      <Input
        value={value}
        placeholder="https://"
        mono
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldRow>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <FieldRow label={label}>
      <select
        value={String(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-ui-sm text-text-primary outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldRow>
  );
}

export function resolveImageUrl(url: string): string {
  return url.trim();
}

export function asString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}
