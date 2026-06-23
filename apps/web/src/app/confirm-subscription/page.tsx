import { Suspense } from "react";
import { ConfirmSubscriptionView } from "@/components/contacts/confirm-subscription-view";

export default function ConfirmSubscriptionPage() {
  return (
    <Suspense>
      <ConfirmSubscriptionView />
    </Suspense>
  );
}
