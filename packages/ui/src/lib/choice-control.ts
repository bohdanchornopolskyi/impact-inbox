import { cn } from "./cn";

export const choiceRootClass =
  "group inline-flex items-center gap-[9px] text-sm text-text has-[:disabled]:cursor-not-allowed has-[:disabled]:text-text-3";

export const choiceInputClass =
  "peer sr-only focus-visible:outline-none";

const choiceMarkBaseClass =
  "pointer-events-none relative flex size-[18px] shrink-0 items-center justify-center border bg-surface transition-[border-color,background-color,box-shadow] duration-150 ease-out group-hover:border-neutral-400 group-hover:bg-bg peer-focus:border-accent peer-focus:shadow-[var(--shadow-ring-accent)] peer-disabled:border-neutral-200 peer-disabled:bg-neutral-100 peer-disabled:group-hover:border-neutral-200 peer-disabled:group-hover:bg-neutral-100";

export const checkboxMarkClass = cn(
  choiceMarkBaseClass,
  "rounded-xs border-border-strong [&_svg]:opacity-0 peer-checked:border-transparent peer-checked:bg-accent peer-checked:group-hover:border-transparent peer-checked:group-hover:bg-accent peer-checked:[&_.check]:opacity-100 peer-checked:peer-disabled:border-brand-200 peer-checked:peer-disabled:bg-brand-200 peer-checked:peer-disabled:group-hover:border-brand-200 peer-checked:peer-disabled:group-hover:bg-brand-200 data-[indeterminate]:border-transparent data-[indeterminate]:bg-accent data-[indeterminate]:group-hover:border-transparent data-[indeterminate]:group-hover:bg-accent data-[indeterminate]:[&_.check]:opacity-0 data-[indeterminate]:[&_.minus]:opacity-100 data-[indeterminate]:peer-checked:[&_.check]:opacity-0",
);

export const checkboxBoxMarkClass = cn(
  checkboxMarkClass,
  "group-hover:border-accent group-hover:bg-surface",
);

export const radioMarkClass = cn(
  choiceMarkBaseClass,
  "rounded-full border-border-strong peer-checked:border-[5px] peer-checked:border-accent peer-checked:bg-surface peer-checked:group-hover:border-accent peer-checked:group-hover:bg-surface peer-checked:peer-focus:border-accent peer-checked:peer-disabled:border-brand-200 peer-checked:peer-disabled:bg-neutral-100 peer-checked:peer-disabled:group-hover:border-brand-200 peer-checked:peer-disabled:group-hover:bg-neutral-100",
);
