"use client";

import type { ReactNode } from "react";
import { Input } from "@repo/ui/client";

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
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <FieldRow label={label}>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-ui-sm text-text-primary outline-none"
        />
      ) : (
        <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
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
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
}) {
  return (
    <FieldRow label={label}>
      <Input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
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
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <FieldRow label={label}>
      <Input
        value={value ?? ""}
        placeholder="#000000"
        mono
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldRow>
  );
}

export function UrlField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldRow label={label}>
      <Input
        value={value}
        placeholder="https://"
        mono
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
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <FieldRow label={label}>
      <select
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-border-strong bg-surface-card px-3 py-2 text-ui-sm text-text-primary outline-none"
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
