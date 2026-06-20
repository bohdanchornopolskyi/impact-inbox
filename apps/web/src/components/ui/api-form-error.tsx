import { FormError } from "@repo/ui/client";
import { ApiClientError } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";

type ApiFormErrorProps = {
  error: Error | null;
};

export function ApiFormError({ error }: ApiFormErrorProps) {
  if (!error) {
    return null;
  }

  const message = getApiErrorMessage(error);
  const details =
    error instanceof ApiClientError ? error.details?.join(" ") : undefined;

  return <FormError message={message} details={details} />;
}
