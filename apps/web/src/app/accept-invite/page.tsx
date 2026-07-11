import { Suspense } from "react";
import { AcceptInviteView } from "@/components/auth/accept-invite-view";

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteView />
    </Suspense>
  );
}
