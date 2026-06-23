"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@repo/ui/client";
import {
  formatPhysicalAddress,
  hasWorkspaceRoleAtLeast,
  normalizePhysicalAddress,
  physicalAddressFromData,
  type PhysicalAddressFields,
} from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useUpdateWorkspaceSettings } from "@/lib/workspaces/workspace-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";

const ADDRESS_FIELDS: {
  key: keyof PhysicalAddressFields;
  label: string;
  placeholder: string;
  optional?: boolean;
}[] = [
  {
    key: "streetLine1",
    label: "Street address",
    placeholder: "123 Main St",
  },
  {
    key: "streetLine2",
    label: "Apt, suite, etc.",
    placeholder: "Suite 100",
    optional: true,
  },
  {
    key: "city",
    label: "City",
    placeholder: "San Francisco",
  },
  {
    key: "state",
    label: "State / province",
    placeholder: "CA",
    optional: true,
  },
  {
    key: "postalCode",
    label: "ZIP / postal code",
    placeholder: "94102",
  },
  {
    key: "country",
    label: "Country",
    placeholder: "United States",
  },
];

export function WorkspaceGeneralSection() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const updateWorkspaceSettings = useUpdateWorkspaceSettings();
  const update = useToastMutation({
    mutationFn: (input: Parameters<typeof updateWorkspaceSettings.mutateAsync>[0]) =>
      updateWorkspaceSettings.mutateAsync(input),
    successMessage: "Workspace updated",
    errorMessage: "Could not update workspace",
  });
  const [address, setAddress] = useState<PhysicalAddressFields>(() =>
    physicalAddressFromData(workspace.physicalAddress),
  );

  useEffect(() => {
    setAddress(physicalAddressFromData(workspace.physicalAddress));
  }, [workspace.physicalAddress]);

  const formattedAddress = formatPhysicalAddress(workspace.physicalAddress);

  if (!canManage) {
    return (
      <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
        <h2 className="text-ui-lg font-medium text-text-primary">General</h2>
        <p className="mt-2 whitespace-pre-line text-ui-sm text-text-secondary">
          {formattedAddress || "Physical address not set"}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-sm">
      <h2 className="text-ui-lg font-medium text-text-primary">General</h2>
      <p className="mt-1 text-ui-sm text-text-secondary">
        CAN-SPAM postal address used in emails from this workspace.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ADDRESS_FIELDS.map((field) => (
          <label
            key={field.key}
            className={
              field.key === "streetLine1" || field.key === "streetLine2"
                ? "space-y-1 sm:col-span-2"
                : "space-y-1"
            }
          >
            <span className="text-ui-xs text-text-secondary">
              {field.label}
              {field.optional ? " (optional)" : ""}
            </span>
            <Input
              value={address[field.key]}
              placeholder={field.placeholder}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          </label>
        ))}
      </div>
      <Button
        className="mt-4"
        variant="primary"
        disabled={update.isPending}
        onClick={() =>
          update.mutate({
            workspaceId: workspace.id,
            input: { physicalAddress: normalizePhysicalAddress(address) },
          })
        }
      >
        Save address
      </Button>
    </section>
  );
}
