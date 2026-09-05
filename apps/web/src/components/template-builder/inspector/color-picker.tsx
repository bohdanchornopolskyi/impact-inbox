import type {
  CSSProperties,
  HTMLAttributes,
  PointerEvent,
  ReactNode,
} from "react";
import { Check, Pipette } from "lucide-react";
import { Input, cn } from "@repo/ui/client";
import {
  type Hsva,
  hsvaToHex,
  hueColor,
  isHexDark,
  normalizeHex,
  toHexDigits,
} from "./color";

const CHECKERBOARD =
  "conic-gradient(#d2d6dc 25%, #ffffff 0 50%, #d2d6dc 0 75%, #ffffff 0)";

const THUMB_SHADOW = "0 0 0 2px #ffffff, 0 0 0 3px rgb(15 23 42 / 0.22)";
const SLIDER_INSET = 8;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function PointerArea({
  className,
  style,
  onMove,
  insetX = 0,
  children,
  ...props
}: {
  onMove: (x: number, y: number) => void;
  insetX?: number;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  function point(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.max(rect.width - insetX * 2, 1);
    onMove(
      clamp01((event.clientX - rect.left - insetX) / width),
      clamp01((event.clientY - rect.top) / rect.height),
    );
  }

  return (
    <div
      {...props}
      className={cn("touch-none select-none", className)}
      style={style}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        point(event);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          return;
        }
        point(event);
      }}
    >
      {children}
    </div>
  );
}

function Thumb({
  color,
  style,
}: {
  color: string;
  style: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className="absolute size-4 rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: THUMB_SHADOW,
        ...style,
      }}
    />
  );
}

export function SaturationField({
  hsva,
  color,
  onChange,
}: {
  hsva: Hsva;
  color: string;
  onChange: (next: Pick<Hsva, "s" | "v">) => void;
}) {
  return (
    <PointerArea
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.s)}
      tabIndex={0}
      className="relative h-42 before:absolute before:-inset-2 before:content-['']"
      onMove={(x, y) => onChange({ s: x * 100, v: (1 - y) * 100 })}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 10 : 2;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onChange({ s: Math.max(0, hsva.s - step), v: hsva.v });
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onChange({ s: Math.min(100, hsva.s + step), v: hsva.v });
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onChange({ s: hsva.s, v: Math.max(0, hsva.v - step) });
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onChange({ s: hsva.s, v: Math.min(100, hsva.v + step) });
        }
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[8px]"
        style={{
          backgroundColor: hueColor(hsva.h),
          backgroundImage:
            "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
      />
      <Thumb
        color={color}
        style={{
          left: `${hsva.s}%`,
          top: `${100 - hsva.v}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </PointerArea>
  );
}

function SliderTrack({
  label,
  value,
  max,
  color,
  trackStyle,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  trackStyle: CSSProperties;
  onChange: (next: number) => void;
}) {
  const percent = (value / max) * 100;

  return (
    <PointerArea
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      className="relative h-5"
      insetX={SLIDER_INSET}
      onMove={(x) => onChange(x * max)}
      onKeyDown={(event) => {
        const step = event.shiftKey ? max / 10 : max / 50;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          onChange(Math.max(0, value - step));
        }
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          onChange(Math.min(max, value + step));
        }
        if (event.key === "Home") {
          event.preventDefault();
          onChange(0);
        }
        if (event.key === "End") {
          event.preventDefault();
          onChange(max);
        }
      }}
    >
      <div
        className="absolute inset-x-2 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full"
        style={trackStyle}
      />
      <Thumb
        color={color}
        style={{
          left: `calc(${SLIDER_INSET}px + ${percent} / 100 * (100% - ${SLIDER_INSET * 2}px))`,
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </PointerArea>
  );
}

export function HueSlider({
  hsva,
  color,
  onChange,
}: {
  hsva: Hsva;
  color: string;
  onChange: (h: number) => void;
}) {
  return (
    <SliderTrack
      label="Hue"
      value={hsva.h}
      max={360}
      color={color}
      onChange={onChange}
      trackStyle={{
        background:
          "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
      }}
    />
  );
}

export function AlphaSlider({
  hsva,
  color,
  onChange,
}: {
  hsva: Hsva;
  color: string;
  onChange: (a: number) => void;
}) {
  return (
    <SliderTrack
      label="Opacity"
      value={hsva.a * 100}
      max={100}
      color={color}
      onChange={(next) => onChange(next / 100)}
      trackStyle={{
        backgroundImage: `linear-gradient(to right, transparent, ${color}), ${CHECKERBOARD}`,
        backgroundSize: "100% 100%, 8px 8px",
      }}
    />
  );
}

export function EyedropperButton({
  onPick,
}: {
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Pick color from screen"
      className="relative flex size-8 shrink-0 items-center justify-center rounded-sm text-text-2 transition-colors duration-150 before:absolute before:-inset-1 before:content-[''] hover:bg-surface-sunken hover:text-text motion-safe:active:scale-[0.96]"
      onClick={onPick}
    >
      <Pipette className="size-4" strokeWidth={1.5} />
    </button>
  );
}

export function ColorValues({
  label,
  hexDraft,
  opacityDraft,
  onHexChange,
  onHexBlur,
  onOpacityChange,
  onOpacityBlur,
}: {
  label: string;
  hexDraft: string;
  opacityDraft: string;
  onHexChange: (value: string) => void;
  onHexBlur: () => void;
  onOpacityChange: (value: string) => void;
  onOpacityBlur: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <Input
          aria-label={`${label} hex`}
          leadingIcon={<span className="font-mono text-sm">#</span>}
          value={hexDraft}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={6}
          mono
          className="pl-1.5 uppercase"
          onChange={(event) => onHexChange(event.target.value)}
          onBlur={onHexBlur}
        />
      </div>
      <div className="w-14 shrink-0">
        <Input
          aria-label={`${label} opacity`}
          value={opacityDraft}
          inputMode="numeric"
          autoComplete="off"
          maxLength={3}
          mono
          className="px-2 text-center tabular-nums"
          onChange={(event) => onOpacityChange(event.target.value)}
          onBlur={onOpacityBlur}
        />
      </div>
      <span className="text-sm text-text-3" aria-hidden>
        %
      </span>
    </div>
  );
}

export function ColorSwatch({
  color,
  selected,
  onSelect,
}: {
  color: string;
  selected: boolean;
  onSelect: (color: string) => void;
}) {
  const hex = normalizeHex(color);
  const dark = isHexDark(hex);

  return (
    <button
      type="button"
      aria-label={toHexDigits(hex)}
      aria-pressed={selected}
      className={cn(
        "relative size-7 rounded-sm shadow-[inset_0_0_0_1px_rgb(15_23_42/0.12)] transition-[transform,box-shadow] duration-150 motion-safe:active:scale-[0.96]",
        hex === "#ffffff" && "border border-border-strong",
      )}
      style={{ backgroundColor: hex }}
      onClick={() => onSelect(hex)}
    >
      {selected ? (
        <Check
          aria-hidden
          className={cn(
            "absolute inset-0 m-auto size-3.5",
            dark ? "text-white" : "text-text",
          )}
          strokeWidth={2.5}
        />
      ) : null}
    </button>
  );
}

export function SwatchSection({
  label,
  colors,
  selected,
  onSelect,
}: {
  label: string;
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
}) {
  if (colors.length === 0) {
    return null;
  }

  const current = normalizeHex(selected);

  return (
    <div className="space-y-2">
      <p className="text-2xs font-semibold tracking-[0.08em] text-text-3 uppercase">
        {label}
      </p>
      <div className="flex gap-2">
        {colors.map((color) => (
          <ColorSwatch
            key={color}
            color={color}
            selected={normalizeHex(color) === current}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorPickerPanel({
  label,
  hsva,
  hexDraft,
  opacityDraft,
  brandColors,
  recentColors,
  hasEyeDropper,
  onPatch,
  onHexChange,
  onHexBlur,
  onOpacityChange,
  onOpacityBlur,
  onSwatch,
  onEyeDropper,
}: {
  label: string;
  hsva: Hsva;
  hexDraft: string;
  opacityDraft: string;
  brandColors: string[];
  recentColors: string[];
  hasEyeDropper: boolean;
  onPatch: (partial: Partial<Hsva>, remember?: boolean) => void;
  onHexChange: (value: string) => void;
  onHexBlur: () => void;
  onOpacityChange: (value: string) => void;
  onOpacityBlur: () => void;
  onSwatch: (hex: string) => void;
  onEyeDropper: () => void;
}) {
  const color = hsvaToHex(hsva);

  return (
    <div className="flex flex-col gap-3">
      <SaturationField
        hsva={hsva}
        color={color}
        onChange={(next) => onPatch(next)}
      />
      <div className="flex items-center gap-3">
        {hasEyeDropper ? <EyedropperButton onPick={onEyeDropper} /> : null}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <HueSlider
            hsva={hsva}
            color={color}
            onChange={(h) => onPatch({ h })}
          />
          <AlphaSlider
            hsva={hsva}
            color={color}
            onChange={(a) => onPatch({ a })}
          />
        </div>
      </div>
      <ColorValues
        label={label}
        hexDraft={hexDraft}
        opacityDraft={opacityDraft}
        onHexChange={onHexChange}
        onHexBlur={onHexBlur}
        onOpacityChange={onOpacityChange}
        onOpacityBlur={onOpacityBlur}
      />
      <div className="h-px bg-border" />
      <SwatchSection
        label="Brand"
        colors={brandColors}
        selected={color}
        onSelect={onSwatch}
      />
      <SwatchSection
        label="Recent"
        colors={recentColors}
        selected={color}
        onSelect={onSwatch}
      />
    </div>
  );
}
