type ContactStatusBadgeProps = {
  status?: "subscribed" | "pending" | "unsubscribed";
  suppressed?: boolean;
  globallyUnsubscribed?: boolean;
};

const styles: Record<string, string> = {
  subscribed: "bg-status-success-bg text-status-success-fg",
  pending: "bg-status-warning-bg text-status-warning-fg",
  unsubscribed: "bg-surface-inset text-text-secondary",
  suppressed: "bg-status-error-bg text-status-error-fg",
  global: "bg-surface-inset text-text-secondary",
};

export function ContactStatusBadge({
  status,
  suppressed,
  globallyUnsubscribed,
}: ContactStatusBadgeProps) {
  if (suppressed) {
    return (
      <span className={`rounded-full px-2 py-0.5 text-ui-xs font-medium ${styles.suppressed}`}>
        Suppressed
      </span>
    );
  }

  if (globallyUnsubscribed) {
    return (
      <span className={`rounded-full px-2 py-0.5 text-ui-xs font-medium ${styles.global}`}>
        Global unsub
      </span>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-ui-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
