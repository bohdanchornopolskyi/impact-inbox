import { cn } from "../../lib/cn";

export const ZOOM_MIN = 50;
export const ZOOM_MAX = 150;
export const ZOOM_STEP = 10;
export const ZOOM_DEFAULT = 100;

export function clampZoom(
  value: number,
  min = ZOOM_MIN,
  max = ZOOM_MAX,
  step = ZOOM_STEP,
) {
  const stepped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, stepped));
}

export type ZoomControlProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ZoomControl({
  value,
  onChange,
  min = ZOOM_MIN,
  max = ZOOM_MAX,
  step = ZOOM_STEP,
  disabled = false,
  className,
}: ZoomControlProps) {
  const zoom = clampZoom(value, min, max, step);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-bg p-0.75",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Zoom out"
        disabled={disabled || zoom <= min}
        onClick={() => onChange(clampZoom(zoom - step, min, max, step))}
        className="inline-flex size-[26px] items-center justify-center rounded-sm text-text-2 transition-[background-color,color] duration-150 ease-out hover:bg-surface disabled:text-text-3 disabled:hover:bg-transparent"
      >
        <span className="inline-flex size-4 [&_svg]:size-full">
          <MinusIcon />
        </span>
      </button>
      <span className="w-10.5 text-center text-xs font-semibold tabular-nums text-text-2">
        {zoom}%
      </span>
      <button
        type="button"
        aria-label="Zoom in"
        disabled={disabled || zoom >= max}
        onClick={() => onChange(clampZoom(zoom + step, min, max, step))}
        className="inline-flex size-[26px] items-center justify-center rounded-sm text-text-2 transition-[background-color,color] duration-150 ease-out hover:bg-surface disabled:text-text-3 disabled:hover:bg-transparent"
      >
        <span className="inline-flex size-4 [&_svg]:size-full">
          <PlusIcon />
        </span>
      </button>
    </div>
  );
}
