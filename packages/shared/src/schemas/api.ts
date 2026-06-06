export const API_ERROR_CODES = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
  "VALIDATION_ERROR",
  "UNKNOWN_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  details?: string[];
};

export type ApiSuccess<T> = {
  data: T;
};

export type ApiFailure = {
  error: ApiError;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const HTTP_STATUS_TO_CODE = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  500: "INTERNAL_SERVER_ERROR",
} as const satisfies Record<number, ApiErrorCode>;

export function resolveApiErrorCode(status: number): ApiErrorCode {
  return HTTP_STATUS_TO_CODE[status as keyof typeof HTTP_STATUS_TO_CODE] ?? "UNKNOWN_ERROR";
}
