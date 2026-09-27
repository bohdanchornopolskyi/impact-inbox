"use client";

import type {
  ChangeEvent,
  FocusEvent,
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactNode,
  Ref,
} from "react";
import { useId, useState } from "react";
import {
  Input,
  InspectorRow,
  Select,
  Switch,
  Textarea,
  UnitField,
} from "@repo/ui/client";
import { commitNumberDraft } from "./number-draft";

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
  onBlur,
  onKeyDown,
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
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
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
          onBlur={onBlur}
          onKeyDown={onKeyDown}
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
          onBlur={onBlur}
          onKeyDown={onKeyDown}
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
  optional = false,
  unit,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  optional?: boolean;
  unit?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState<{
    text: string;
    base: number | undefined;
  } | null>(null);
  const shown =
    draft !== null && Object.is(draft.base, value)
      ? draft.text
      : value === undefined
        ? ""
        : String(value);

  function commit(raw: string) {
    const result = commitNumberDraft(raw, { min, max, optional });

    if (result.status === "keep") {
      setDraft(null);
      return;
    }

    if (result.status === "unset") {
      if (value === undefined) {
        setDraft(null);
        return;
      }
      setDraft({ text: "", base: value });
      onChange(undefined);
      return;
    }

    if (result.value === value) {
      setDraft(null);
      return;
    }

    setDraft({ text: String(result.value), base: value });
    onChange(result.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    event.currentTarget.blur();
  }

  const inputProps = {
    id,
    value: shown,
    min,
    max,
    placeholder,
    disabled,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setDraft({ text: event.target.value, base: value });
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      commit(event.currentTarget.value);
    },
    onKeyDown: handleKeyDown,
  };

  return (
    <InspectorRow label={label} htmlFor={id}>
      {unit ? (
        <UnitField className="h-8" unit={unit} {...inputProps} />
      ) : (
        <Input className="h-8" type="number" {...inputProps} />
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
