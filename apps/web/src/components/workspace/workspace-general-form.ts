import {
  formatPhysicalAddress,
  normalizePhysicalAddress,
  physicalAddressFromData,
  type PhysicalAddressFields,
  type UpdateWorkspaceInput,
  type WorkspaceDetailData,
  type WorkspaceGeneralFormValues,
} from "@repo/shared";
import type { SaveStatusTone } from "@repo/ui/client";

export const GENERAL_FORM_ID = "workspace-general-form";

export const ADDRESS_KEYS = [
  "streetLine1",
  "streetLine2",
  "city",
  "state",
  "postalCode",
  "country",
] as const satisfies readonly (keyof PhysicalAddressFields)[];

const FIELD_KEYS = [
  "name",
  "slug",
  ...ADDRESS_KEYS,
] as const satisfies readonly (keyof WorkspaceGeneralFormValues)[];

type GeneralDirtyFields = Partial<
  Readonly<Record<keyof WorkspaceGeneralFormValues, boolean | undefined>>
>;

export function generalFormValues(
  workspace: Pick<WorkspaceDetailData, "name" | "slug" | "physicalAddress">,
): WorkspaceGeneralFormValues {
  return {
    name: workspace.name,
    slug: workspace.slug,
    ...physicalAddressFromData(workspace.physicalAddress),
  };
}

export function addressFieldsFrom(
  values: Partial<PhysicalAddressFields>,
): PhysicalAddressFields {
  return {
    streetLine1: values.streetLine1 ?? "",
    streetLine2: values.streetLine2 ?? "",
    city: values.city ?? "",
    state: values.state ?? "",
    postalCode: values.postalCode ?? "",
    country: values.country ?? "",
  };
}

export function formatAppearsAs(name: string, fields: PhysicalAddressFields) {
  const formatted = formatPhysicalAddress(normalizePhysicalAddress(fields));
  const parts = [name.trim(), ...(formatted ? formatted.split("\n") : [])].filter(
    Boolean,
  );

  return parts.join(", ");
}

export function savedGeneralValues(
  values: WorkspaceGeneralFormValues,
): WorkspaceGeneralFormValues {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    ...physicalAddressFromData(
      normalizePhysicalAddress(addressFieldsFrom(values)),
    ),
  };
}

export function areGeneralValuesEqual(
  a: WorkspaceGeneralFormValues,
  b: WorkspaceGeneralFormValues,
) {
  return FIELD_KEYS.every((key) => a[key] === b[key]);
}

export function buildGeneralUpdate(
  workspace: WorkspaceDetailData,
  values: WorkspaceGeneralFormValues,
): UpdateWorkspaceInput | null {
  const next = savedGeneralValues(values);
  const saved = physicalAddressFromData(workspace.physicalAddress);
  const isAddressChanged = ADDRESS_KEYS.some((key) => next[key] !== saved[key]);

  const input: UpdateWorkspaceInput = {
    ...(next.name !== workspace.name ? { name: next.name } : {}),
    ...(next.slug !== workspace.slug ? { slug: next.slug } : {}),
    ...(isAddressChanged
      ? { physicalAddress: normalizePhysicalAddress(addressFieldsFrom(next)) }
      : {}),
  };

  return Object.keys(input).length > 0 ? input : null;
}

export function countDirtyFields(dirtyFields: GeneralDirtyFields) {
  return FIELD_KEYS.filter((key) => dirtyFields[key]).length;
}

function unsavedLabel(count: number) {
  if (count === 0) {
    return "No unsaved changes";
  }

  return count === 1 ? "1 unsaved change" : `${count} unsaved changes`;
}

export function generalSaveStatus({
  isSaving,
  hasErrors,
  dirtyCount,
}: {
  isSaving: boolean;
  hasErrors: boolean;
  dirtyCount: number;
}): { tone: SaveStatusTone; label: string } {
  if (isSaving) {
    return { tone: "saving", label: "Saving" };
  }

  if (hasErrors) {
    return { tone: "error", label: "Fix the highlighted fields" };
  }

  return {
    tone: dirtyCount > 0 ? "unsaved" : "saved",
    label: unsavedLabel(dirtyCount),
  };
}
