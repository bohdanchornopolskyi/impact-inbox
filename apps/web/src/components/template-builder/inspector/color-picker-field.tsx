"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { BasePopover, cn } from "@repo/ui/client";
import { useOptionalWorkspace } from "@/contexts/workspace-context";
import { FieldRow } from "./fields";
import { ColorPickerPanel } from "./color-picker";
import {
  type Hsva,
  brandSwatches,
  hexToHsva,
  hsvaToHex,
  isValidHex,
  normalizeHex,
  readRecentColors,
  rememberRecentColor,
  resolveColorDraft,
  toHexDigits,
} from "./color";

export {
  normalizeHex,
  resolveColorDraft,
  shouldPersistColorDraft,
} from "./color";

type EyeDropperResult = { sRGBHex: string };
type EyeDropperApi = { open: () => Promise<EyeDropperResult> };

function subscribeNever() {
  return () => undefined;
}

function hasEyeDropperApi() {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

function createEyeDropper(): EyeDropperApi | null {
  const ctor = (
    window as unknown as { EyeDropper?: new () => EyeDropperApi }
  ).EyeDropper;
  return ctor ? new ctor() : null;
}

function ColorTriggerSwatch({
  hex,
  alpha,
}: {
  hex: string;
  alpha: number;
}) {
  return (
    <span
      className={cn(
        "relative size-5 shrink-0 overflow-hidden rounded-xs shadow-[inset_0_0_0_1px_rgb(15_23_42/0.12)]",
        hex === "#ffffff" && "border border-border-strong",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "conic-gradient(#d2d6dc 25%, #ffffff 0 50%, #d2d6dc 0 75%, #ffffff 0)",
          backgroundSize: "8px 8px",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: hex, opacity: alpha }}
      />
    </span>
  );
}

export function ColorPickerField({
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
  const id = useId();
  const workspace = useOptionalWorkspace();
  const committedHex = resolveColorDraft(value, fallback);
  const [open, setOpen] = useState(false);
  const [hsva, setHsva] = useState<Hsva>(() => hexToHsva(committedHex));
  const [hexDraft, setHexDraft] = useState(() => toHexDigits(committedHex));
  const [opacityDraft, setOpacityDraft] = useState("100");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const hsvaRef = useRef(hsva);
  const hexAtOpenRef = useRef(committedHex);
  const eyedropperLockRef = useRef(false);
  const hasEyeDropper = useSyncExternalStore(
    subscribeNever,
    hasEyeDropperApi,
    () => false,
  );

  const displayHex = open ? hsvaToHex(hsva) : committedHex;
  const brandColors = brandSwatches(
    workspace?.workspace.brandKit?.colors?.primary,
  );

  function emitHex(hex: string, remember: boolean) {
    if (disabled) {
      return;
    }
    const normalized = normalizeHex(hex);
    onChange(normalized);
    if (remember) {
      setRecentColors(rememberRecentColor(normalized));
    }
  }

  function applyHsva(next: Hsva) {
    hsvaRef.current = next;
    setHsva(next);
    setHexDraft(toHexDigits(hsvaToHex(next)));
    setOpacityDraft(String(Math.round(next.a * 100)));
  }

  function patchHsva(partial: Partial<Hsva>, remember = false) {
    const next = { ...hsvaRef.current, ...partial };
    const hexChanged =
      partial.h !== undefined ||
      partial.s !== undefined ||
      partial.v !== undefined;
    applyHsva(next);
    if (hexChanged) {
      emitHex(hsvaToHex(next), remember);
    }
  }

  function selectHex(hex: string, remember: boolean) {
    const next = hexToHsva(hex, hsvaRef.current.h, hsvaRef.current.a);
    applyHsva(next);
    emitHex(hex, remember);
  }

  function handleOpenChange(
    nextOpen: boolean,
    details: { cancel: () => void },
  ) {
    if (disabled) {
      return;
    }
    if (!nextOpen && eyedropperLockRef.current) {
      details.cancel();
      return;
    }

    if (nextOpen) {
      const next = hexToHsva(committedHex, hsvaRef.current.h, hsvaRef.current.a);
      hexAtOpenRef.current = committedHex;
      applyHsva(next);
      setRecentColors(readRecentColors());
    } else {
      const hex = hsvaToHex(hsvaRef.current);
      if (hex !== hexAtOpenRef.current) {
        setRecentColors(rememberRecentColor(hex));
      }
      setHexDraft(toHexDigits(hex));
      setOpacityDraft(String(Math.round(hsvaRef.current.a * 100)));
    }

    setOpen(nextOpen);
  }

  function handleHexChange(raw: string) {
    const digits = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setHexDraft(digits);
    if (digits.length === 6 && isValidHex(digits)) {
      selectHex(normalizeHex(digits), true);
    }
  }

  function handleHexBlur() {
    setHexDraft(toHexDigits(hsvaToHex(hsvaRef.current)));
  }

  function handleOpacityChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    setOpacityDraft(digits);
    if (digits === "") {
      return;
    }
    const next = Math.min(100, Number(digits));
    if (!Number.isFinite(next)) {
      return;
    }
    patchHsva({ a: next / 100 });
  }

  function handleOpacityBlur() {
    setOpacityDraft(String(Math.round(hsvaRef.current.a * 100)));
  }

  function handleEyeDropper() {
    const eyeDropper = createEyeDropper();
    if (!eyeDropper) {
      return;
    }
    eyedropperLockRef.current = true;
    void eyeDropper
      .open()
      .then((result) => {
        if (isValidHex(result.sRGBHex)) {
          selectHex(normalizeHex(result.sRGBHex), true);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        eyedropperLockRef.current = false;
      });
  }

  return (
    <FieldRow label={label} htmlFor={id}>
      <BasePopover.Root open={open} onOpenChange={handleOpenChange}>
        <BasePopover.Trigger
          id={id}
          type="button"
          disabled={disabled}
          aria-label={`Pick ${label.toLowerCase()}`}
          className={cn(
            "flex h-control-md w-full items-center gap-2 rounded-sm border bg-surface px-2.5 text-left transition-[border-color,box-shadow] duration-150 ease-out",
            open
              ? "border-accent"
              : "border-border-strong hover:border-neutral-400",
            disabled &&
              "cursor-not-allowed border-neutral-200 bg-neutral-100 text-text-3 hover:border-neutral-200",
          )}
        >
          <ColorTriggerSwatch hex={displayHex} alpha={hsva.a} />
          <span className="min-w-0 flex-1 font-mono text-sm font-semibold tabular-nums">
            {toHexDigits(displayHex)}
          </span>
          <span className="font-mono text-sm tabular-nums text-text-3">
            {Math.round(hsva.a * 100)}%
          </span>
        </BasePopover.Trigger>
        <BasePopover.Portal>
          <BasePopover.Positioner align="start" sideOffset={8}>
            <BasePopover.Popup className="z-50 w-70 rounded-xl border border-border-subtle bg-surface p-4 shadow-pop outline-none">
              <ColorPickerPanel
                label={label}
                hsva={hsva}
                hexDraft={hexDraft}
                opacityDraft={opacityDraft}
                brandColors={brandColors}
                recentColors={recentColors}
                hasEyeDropper={hasEyeDropper}
                onPatch={patchHsva}
                onHexChange={handleHexChange}
                onHexBlur={handleHexBlur}
                onOpacityChange={handleOpacityChange}
                onOpacityBlur={handleOpacityBlur}
                onSwatch={(hex) => selectHex(hex, true)}
                onEyeDropper={handleEyeDropper}
              />
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    </FieldRow>
  );
}
