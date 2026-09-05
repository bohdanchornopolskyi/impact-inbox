"use client";

import type { ReactNode, Ref } from "react";
import { useId } from "react";
import { Input, Select, Textarea } from "@repo/ui/client";
import { ColorPickerField } from "./color-picker-field";

export function InspectorRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-19.5 shrink-0 text-xs text-text-2">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block text-xs font-medium text-text-2">
          {label}
        </label>
      ) : (
        <div className="block text-xs font-medium text-text-2">{label}</div>
      )}
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
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <FieldRow label={label} htmlFor={id}>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
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
  placeholder,
  disabled = false,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <FieldRow label={label} htmlFor={id}>
      <Input
        id={id}
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        placeholder={placeholder}
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
  const id = useId();

  return (
    <FieldRow label={label} htmlFor={id}>
      <Input
        id={id}
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
  const id = useId();

  return (
    <FieldRow label={label} htmlFor={id}>
      <Select
        id={id}
        value={String(value)}
        disabled={disabled}
        options={options}
        onChange={(event) => onChange(event.target.value)}
      />
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
