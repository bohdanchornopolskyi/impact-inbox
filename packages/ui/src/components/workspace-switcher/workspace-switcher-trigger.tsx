import { ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { WorkspaceAvatar } from "../avatar/workspace-avatar";

export function workspaceSwitcherTriggerClassName(className?: string) {
  return cn(
    "group inline-flex items-center gap-2 rounded-sm border border-border px-2.5 py-1.5 text-sm font-medium text-text-2 outline-none transition-[background-color,border-color,color,box-shadow] duration-150 ease-out",
    "hover:border-border-strong hover:bg-surface-sunken",
    "focus-visible:border-accent",
    "data-popup-open:border-border-strong data-popup-open:bg-surface-sunken",
    "data-open:border-border-strong data-open:bg-surface-sunken",
    className,
  );
}

export type WorkspaceSwitcherTriggerProps = {
  name: string;
};

export function WorkspaceSwitcherTrigger({
  name,
}: WorkspaceSwitcherTriggerProps) {
  return (
    <>
      <WorkspaceAvatar name={name} />
      <span className="max-w-40 truncate">{name}</span>
      <ChevronsUpDown
        className="size-3.25 text-text-3 group-data-popup-open:text-text-2 group-data-open:text-text-2"
        strokeWidth={1.5}
        aria-hidden
      />
    </>
  );
}
