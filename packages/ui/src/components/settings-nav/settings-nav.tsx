import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type SettingsNavProps = HTMLAttributes<HTMLElement>;

export function SettingsNav({ className, ...props }: SettingsNavProps) {
  return (
    <nav
      className={cn(
        "flex w-66 shrink-0 flex-col gap-5 border-r border-border bg-surface px-4 py-6",
        className,
      )}
      {...props}
    />
  );
}

export type SettingsNavHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SettingsNavHeader({ title, subtitle }: SettingsNavHeaderProps) {
  return (
    <div className="flex flex-col gap-0.75 px-2">
      <p className="text-[19px] font-bold leading-none text-text">{title}</p>
      {subtitle ? (
        <p className="text-[12.5px] text-text-3">{subtitle}</p>
      ) : null}
    </div>
  );
}

export type SettingsNavGroupProps = {
  title: string;
  children: ReactNode;
};

export function SettingsNavGroup({ title, children }: SettingsNavGroupProps) {
  return (
    <div className="flex flex-col">
      <p className="px-2 text-[10.5px] font-semibold tracking-wide text-text-3 uppercase">
        {title}
      </p>
      <div className="h-1.5" />
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
