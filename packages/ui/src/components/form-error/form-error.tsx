export type FormErrorProps = {
  message: string;
  details?: string;
};

export function FormError({ message, details }: FormErrorProps) {
  return (
    <div
      className="mb-4 rounded-md border border-status-danger-bg bg-status-danger-bg px-3.5 py-3 text-ui-sm text-status-danger-fg"
      role="alert"
    >
      <p>{message}</p>
      {details ? <p className="mt-1 text-ui-xs opacity-85">{details}</p> : null}
    </div>
  );
}
