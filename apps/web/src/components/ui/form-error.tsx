import { ApiClientError } from "@/lib/api-client";

type FormErrorProps = {
  error: Error | null;
};

export function FormError({ error }: FormErrorProps) {
  if (!error) {
    return null;
  }

  const message =
    error instanceof ApiClientError ? error.message : "Something went wrong";

  const details =
    error instanceof ApiClientError ? error.details?.join(" ") : undefined;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
      <p>{message}</p>
      {details ? <p className="mt-1 text-xs opacity-80">{details}</p> : null}
    </div>
  );
}
