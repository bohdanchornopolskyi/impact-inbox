import { cn } from "../../lib/cn";

const fills = ["bg-neutral-900", "bg-brand-500", "bg-success-500"] as const;

function fillFor(name: string) {
  let total = 0;
  for (const character of name) {
    total += character.charCodeAt(0);
  }
  return fills[total % fills.length];
}

function initialFor(name: string) {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}

export type WorkspaceAvatarProps = {
  name: string;
  className?: string;
};

export function WorkspaceAvatar({ name, className }: WorkspaceAvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-xs text-2xs font-semibold text-text-inverse",
        fillFor(name),
        className,
      )}
      aria-hidden
    >
      {initialFor(name)}
    </span>
  );
}
