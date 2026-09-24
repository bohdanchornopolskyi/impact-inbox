import {
  formatPhysicalAddress,
  normalizePhysicalAddress,
  workspaceSlugSchema,
  type PhysicalAddressFields,
  type UpdateWorkspaceInput,
  type WorkspaceDetailData,
} from "@repo/shared";

export const GENERAL_FORM_ID = "workspace-general-form";

const ADDRESS_KEYS = [
  "streetLine1",
  "streetLine2",
  "city",
  "state",
  "postalCode",
  "country",
] as const satisfies readonly (keyof PhysicalAddressFields)[];

function fieldValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ? field.value : "";
}

export function formatAppearsAs(name: string, fields: PhysicalAddressFields) {
  const formatted = formatPhysicalAddress(normalizePhysicalAddress(fields));
  const parts = [name.trim(), ...(formatted ? formatted.split("\n") : [])].filter(
    Boolean,
  );

  return parts.join(", ");
}

export function readGeneralDraft(form: HTMLFormElement) {
  const addressFields = {
    streetLine1: fieldValue(form, "streetLine1"),
    streetLine2: fieldValue(form, "streetLine2"),
    city: fieldValue(form, "city"),
    state: fieldValue(form, "state"),
    postalCode: fieldValue(form, "postalCode"),
    country: fieldValue(form, "country"),
  } satisfies PhysicalAddressFields;

  return {
    name: fieldValue(form, "name"),
    slug: fieldValue(form, "slug"),
    addressFields,
  };
}

export function buildGeneralUpdate(
  workspace: WorkspaceDetailData,
  form: HTMLFormElement,
): UpdateWorkspaceInput | null {
  const draft = readGeneralDraft(form);
  const name = draft.name.trim();
  const slug = draft.slug.trim();

  if (!name || !workspaceSlugSchema.safeParse(slug).success) {
    return null;
  }

  const physicalAddress = normalizePhysicalAddress(draft.addressFields);
  const input: UpdateWorkspaceInput = {
    ...(name !== workspace.name ? { name } : {}),
    ...(slug !== workspace.slug ? { slug } : {}),
    ...(JSON.stringify(physicalAddress) !==
    JSON.stringify(workspace.physicalAddress ?? null)
      ? { physicalAddress }
      : {}),
  };

  return Object.keys(input).length > 0 ? input : null;
}

function changedFieldCount(form: HTMLFormElement) {
  const named = ["name", "slug", ...ADDRESS_KEYS];
  return named.filter((name) => {
    const field = form.elements.namedItem(name);
    return field instanceof HTMLInputElement && field.value !== field.defaultValue;
  }).length;
}

function unsavedLabel(count: number) {
  if (count === 0) {
    return "No unsaved changes";
  }

  return count === 1 ? "1 unsaved change" : `${count} unsaved changes`;
}

export function syncGeneralForm(
  form: HTMLFormElement,
  mode: "idle" | "saving" = "idle",
) {
  const count = changedFieldCount(form);
  const draft = readGeneralDraft(form);
  const canSave =
    Boolean(draft.name.trim()) &&
    workspaceSlugSchema.safeParse(draft.slug.trim()).success &&
    count > 0;
  const busy = mode === "saving";
  const label = form.querySelector("[role='status'] p");
  const discard = form.querySelector<HTMLButtonElement>('button[type="reset"]');
  const save = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const preview = form.querySelector("[data-appears-as]");

  const status = label?.closest<HTMLElement>("[role='status']");

  if (status) {
    status.dataset.tone = busy ? "saving" : count > 0 ? "unsaved" : "saved";
  }

  if (label) {
    label.textContent = busy ? "Saving" : unsavedLabel(count);
  }

  if (discard) {
    discard.disabled = busy || count === 0;
  }

  if (save) {
    save.disabled = busy || !canSave;
  }

  if (preview) {
    const appearsAs = formatAppearsAs(draft.name, draft.addressFields);
    preview.textContent = appearsAs ? `Appears as: ${appearsAs}` : "Appears as:";
  }
}
