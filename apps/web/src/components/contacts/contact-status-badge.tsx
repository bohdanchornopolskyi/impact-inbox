import { Badge } from "@repo/ui/client";

type ContactStatusBadgeProps = {
  status?: "subscribed" | "pending" | "unsubscribed";
  suppressed?: boolean;
  globallyUnsubscribed?: boolean;
};

export function ContactStatusBadge({
  status,
  suppressed,
  globallyUnsubscribed,
}: ContactStatusBadgeProps) {
  if (suppressed) {
    return <Badge tone="danger">Suppressed</Badge>;
  }

  if (globallyUnsubscribed) {
    return <Badge>Global unsub</Badge>;
  }

  if (status === "subscribed") {
    return <Badge tone="success">Subscribed</Badge>;
  }

  if (status === "pending") {
    return <Badge tone="warning">Pending</Badge>;
  }

  if (status === "unsubscribed") {
    return <Badge>Unsubscribed</Badge>;
  }

  return null;
}
