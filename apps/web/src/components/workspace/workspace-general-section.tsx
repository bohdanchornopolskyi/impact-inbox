"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  SettingsPreview,
} from "@repo/ui/client";
import type {
  PhysicalAddressFields,
  WorkspaceGeneralFormValues,
} from "@repo/shared";
import { addressFieldsFrom, formatAppearsAs } from "./workspace-general-form";

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

export function WorkspaceGeneralSection({
  form,
  disabled,
}: {
  form: UseFormReturn<WorkspaceGeneralFormValues>;
  disabled: boolean;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const values = useWatch({ control });
  const appearsAs = formatAppearsAs(
    values.name ?? "",
    addressFieldsFrom(values),
  );

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
        {ADDRESS_ROWS.map((row) => (
          <div
            key={row.map((field) => field.key).join("-")}
            className={row.length > 1 ? "grid gap-4 sm:grid-cols-2" : undefined}
          >
            {row.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                error={errors[field.key]?.message}
                {...register(field.key)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
        <SettingsPreview>
          <span>{appearsAs ? `Appears as: ${appearsAs}` : "Appears as:"}</span>
        </SettingsPreview>
      </CardBody>
    </Card>
  );
}
