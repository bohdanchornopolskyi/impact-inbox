import type { HTMLAttributes } from "react";
import { UserRound } from "lucide-react";
import { cn } from "../../lib/cn";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";

export type InviteSummaryProps = HTMLAttributes<HTMLDivElement> & {
  organizationName: string;
  workspaceName?: string | null;
  invitedBy?: string;
  role: string;
};

export function InviteSummary({
  organizationName,
  workspaceName,
  invitedBy,
  role,
  className,
  ...props
}: InviteSummaryProps) {
  const title = workspaceName
    ? `${organizationName} · ${workspaceName}`
    : organizationName;

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-md bg-surface-sunken p-3.5",
        className,
      )}
      {...props}
    >
      <Avatar name={organizationName} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.75">
        <p className="truncate text-sm font-semibold text-text">{title}</p>
        {invitedBy ? (
          <p className="truncate text-xs text-text-3">Invited by {invitedBy}</p>
        ) : null}
      </div>
      <Badge tone="brand" icon={<UserRound strokeWidth={2} />}>
        {role}
      </Badge>
    </div>
  );
}
