"use client";

import type { UseFormReturn } from "react-hook-form";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, Input } from "@repo/ui/client";
import type { WorkspaceGeneralFormValues } from "@repo/shared";

export function WorkspaceIdentitySection({
  form,
  disabled,
}: {
  form: UseFormReturn<WorkspaceGeneralFormValues>;
  disabled: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace details</CardTitle>
        <CardDescription>
          The slug appears in workspace URLs. Old links keep redirecting after a
          change.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            placeholder="Acme Marketing"
            error={errors.name?.message}
            {...register("name")}
            disabled={disabled}
          />
          <Input
            label="Slug"
            placeholder="acme-marketing"
            prefix="impactinbox.com/"
            mono
            error={errors.slug?.message}
            {...register("slug")}
            disabled={disabled}
          />
        </div>
      </CardBody>
    </Card>
  );
}
