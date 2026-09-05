import { cn } from "../../lib/cn";

export type AvatarProps = {
  name: string;
  className?: string;
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) {
    return "?";
  }
  const last = parts[parts.length - 1];
  if (!last || parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent",
        className,
      )}
      aria-hidden
    >
      {initialsFor(name)}
    </span>
  );
}
