"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBarNav, topNavItemClassName } from "@repo/ui";
import { useOptionalWorkspace } from "@/contexts/workspace-context";

const navItems = [
  { label: "Overview", suffix: "" },
  { label: "Templates", suffix: "/templates" },
  { label: "Contacts", suffix: "/contacts" },
  { label: "Campaigns", suffix: "/campaigns" },
  { label: "Settings", suffix: "/settings" },
] as const;

export function WorkspaceNav() {
  const pathname = usePathname();
  const workspaceContext = useOptionalWorkspace();

  if (!workspaceContext) {
    return null;
  }

  const basePath = `/${workspaceContext.workspace.slug}`;

  return (
    <AppBarNav aria-label="Workspace">
      {navItems.map((item) => {
        const href = `${basePath}${item.suffix}`;
        const isActive =
          item.suffix === ""
            ? pathname === basePath
            : pathname.startsWith(href);

        return (
          <Link
            key={item.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={topNavItemClassName({ active: isActive })}
          >
            {item.label}
          </Link>
        );
      })}
    </AppBarNav>
  );
}
