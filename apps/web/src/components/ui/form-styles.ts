const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-300";

export function inputProps(hasError?: boolean) {
  return {
    className: hasError
      ? `${inputClassName} border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-400`
      : inputClassName,
  };
}

export function submitButtonClassName(isPending: boolean) {
  return `inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 ${
    isPending ? "opacity-80" : ""
  }`;
}
