"use client";

import { LogOut } from "lucide-react";
import { AppBarUser, DropdownMenu, appBarUserClassName } from "@repo/ui/client";
import { useSession } from "@/contexts/session-context";

export function AccountMenu() {
  const { user, signOut } = useSession();

  return (
    <DropdownMenu
      align="end"
      className={appBarUserClassName()}
      items={[
        {
          label: "Sign out",
          icon: <LogOut strokeWidth={1.5} />,
          onSelect: signOut,
        },
      ]}
      trigger={<AppBarUser name={user.name} />}
    />
  );
}
