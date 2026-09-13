"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  SettingsPreview,
} from "@repo/ui/client";
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

type AddressField = {
  key: keyof PhysicalAddressFields;
  label: string;
  placeholder: string;
};

const ADDRESS_ROWS: AddressField[][] = [
  [
    {
      key: "streetLine1",
      label: "Street address",
      placeholder: "123 Main St",
    },
  ],
  [
    {
      key: "streetLine2",
      label: "Apt, suite, etc. (optional)",
      placeholder: "Suite 100",
    },
  ],
  [
    {
      key: "city",
      label: "City",
      placeholder: "San Francisco",
    },
    {
      key: "state",
      label: "State / province (optional)",
      placeholder: "CA",
    },
  ],
  [
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
  ],
];

function formatAppearsAs(name: string, fields: PhysicalAddressFields) {
  const formatted = formatPhysicalAddress(normalizePhysicalAddress(fields));
  const parts = [name.trim(), ...(formatted ? formatted.split("\n") : [])].filter(
    Boolean,
  );

  return parts.join(", ");
}

function AddressFields({
  address,
  disabled,
  onChange,
}: {
  address: PhysicalAddressFields;
  disabled?: boolean;
  onChange: (key: keyof PhysicalAddressFields, value: string) => void;
}) {
  return ADDRESS_ROWS.map((row) => (
    <div
      key={row.map((field) => field.key).join("-")}
      className={row.length > 1 ? "grid gap-4 sm:grid-cols-2" : undefined}
    >
      {row.map((field) => (
        <Input
          key={field.key}
          label={field.label}
          value={address[field.key]}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      ))}
    </div>
  ));
}

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

  const appearsAs = formatAppearsAs(workspace.name, address);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Postal address</CardTitle>
        <CardDescription>
          Required by CAN-SPAM and shown in the footer of every email sent from
          this workspace.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <AddressFields
          address={address}
          disabled={!canManage}
          onChange={(key, value) =>
            setAddress((current) => ({ ...current, [key]: value }))
          }
        />
        <SettingsPreview>Appears as: {appearsAs}</SettingsPreview>
        {canManage ? (
          <Button
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
        ) : null}
      </CardBody>
    </Card>
  );
}
