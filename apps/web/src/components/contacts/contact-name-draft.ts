export type ContactNameFields = {
  firstName: string;
  lastName: string;
};

export function resolveContactNameFields(
  contact: { firstName: string | null; lastName: string | null },
  draft: ContactNameFields | null,
): ContactNameFields {
  if (draft) {
    return draft;
  }

  return {
    firstName: contact.firstName ?? "",
    lastName: contact.lastName ?? "",
  };
}

export function contactNameUpdate(fields: ContactNameFields): {
  firstName: string | null;
  lastName: string | null;
} {
  const firstName = fields.firstName.trim();
  const lastName = fields.lastName.trim();

  return {
    firstName: firstName || null,
    lastName: lastName || null,
  };
}
