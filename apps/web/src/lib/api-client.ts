import type { ApiError, ApiFailure, ApiSuccess } from "@repo/shared";

export class ApiClientError extends Error {
  readonly code: ApiError["code"];
  readonly details?: string[];

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.details = error.details;
  }
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  { body, token, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok) {
    if ("error" in payload) {
      throw new ApiClientError(payload.error);
    }

    throw new ApiClientError({
      code: "UNKNOWN_ERROR",
      message: "Request failed",
    });
  }

  if (!("data" in payload)) {
    throw new ApiClientError({
      code: "UNKNOWN_ERROR",
      message: "Invalid response",
    });
  }

  return payload.data;
}
