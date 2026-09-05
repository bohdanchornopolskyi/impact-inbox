export type FormErrorProps = {
  message: string;
  details?: string;
};

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-full">
      <path
        d="M8 2.5 L14.2 13.5 H1.8 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 6.2 V9.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.4" r="0.7" fill="currentColor" />
    </svg>
  );
}

export function FormError({ message, details }: FormErrorProps) {
  return (
    <div
      className="mb-4 flex gap-2 rounded-sm border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger"
      role="alert"
    >
      <span className="mt-0.5 size-icon-sm shrink-0">
        <WarningIcon />
      </span>
      <div>
        <p>{message}</p>
        {details ? <p className="mt-1 text-xs text-danger/80">{details}</p> : null}
      </div>
    </div>
  );
}
