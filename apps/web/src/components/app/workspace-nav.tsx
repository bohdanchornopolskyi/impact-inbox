"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui";
import { useWorkspace } from "@/contexts/workspace-context";

const navItems = [
  { label: "Overview", suffix: "" },
  { label: "Templates", suffix: "/templates" },
  { label: "Contacts", suffix: "/contacts" },
  { label: "Campaigns", suffix: "/campaigns" },
  { label: "Settings", suffix: "/settings" },
] as const;

export function WorkspaceNav() {
  const pathname = usePathname();
  const { workspace } = useWorkspace();
  const basePath = `/${workspace.slug}`;

  return (
    <nav className="border-b border-border-default bg-surface-muted">
      <div className="flex gap-1 overflow-x-auto px-4 sm:px-6">
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
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-ui-sm font-medium transition-colors",
                isActive
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
