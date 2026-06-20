import type { ApiErrorCode } from "@repo/shared";
import { ApiClientError } from "@/lib/api-client";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.details?.length
      ? `${error.message} ${error.details.join(" ")}`
      : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function isApiErrorCode(
  error: unknown,
  code: ApiErrorCode,
): error is ApiClientError {
  return error instanceof ApiClientError && error.code === code;
}
