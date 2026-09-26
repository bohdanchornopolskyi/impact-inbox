"use client";

import type { ReactNode, Ref } from "react";
import { useId } from "react";
import {
  Input,
  InspectorRow,
  Select,
  Switch,
  Textarea,
  UnitField,
} from "@repo/ui/client";

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
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  const id = useId();

  return (
    <InspectorRow label={label} htmlFor={id} hint={hint}>
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
    </InspectorRow>
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
  unit,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  unit?: string;
}) {
  const id = useId();

  function handleChange(raw: string) {
    onChange(raw === "" ? undefined : Number(raw));
  }

  return (
    <InspectorRow label={label} htmlFor={id}>
      {unit ? (
        <UnitField
          id={id}
          className="h-8"
          value={value ?? ""}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          unit={unit}
          onChange={(event) => handleChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          className="h-8"
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => handleChange(event.target.value)}
        />
      )}
    </InspectorRow>
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
    <InspectorRow label={label} htmlFor={id}>
      <Input
        id={id}
        value={value}
        placeholder="https://"
        mono
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </InspectorRow>
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
    <InspectorRow label={label} htmlFor={id}>
      <Select
        id={id}
        value={String(value)}
        disabled={disabled}
        options={options}
        onChange={(event) => onChange(event.target.value)}
      />
    </InspectorRow>
  );
}

export function BooleanField({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <InspectorRow label={label} htmlFor={id}>
      <div className="flex justify-end">
        <Switch
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </div>
    </InspectorRow>
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
