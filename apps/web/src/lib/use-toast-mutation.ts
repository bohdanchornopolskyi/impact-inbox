"use client";

import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { showError, showToast } from "@/stores/toast-store";

function asMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export type UseToastMutationOptions<
  TData,
  TError,
  TVariables,
  TContext,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  /** Toast shown on success. Omit to stay silent on success. */
  successMessage?: string;
  /** Fallback message when the thrown error has no usable message. */
  errorMessage?: string;
};

/**
 * Wraps react-query `useMutation` with standardized toast handling: a success
 * toast (when `successMessage` is provided) and an error toast via `showError`
 * (falling back to `errorMessage`). Returns the unmodified useMutation result so
 * call sites can use `mutate`/`mutateAsync`/`isPending` as usual.
 */
export function useToastMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>({
  successMessage,
  errorMessage = "Something went wrong",
  onSuccess,
  onError,
  ...options
}: UseToastMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> {
  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onSuccess: (...args) => {
      if (successMessage) {
        showToast(successMessage);
      }
      onSuccess?.(...args);
    },
    onError: (...args) => {
      showError(asMessage(args[0], errorMessage));
      onError?.(...args);
    },
  });
}
