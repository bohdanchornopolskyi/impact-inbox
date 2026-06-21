export const CONTACT_MERGE_TAGS = [
  { tag: "firstName", label: "First name", description: "Contact first name" },
  { tag: "lastName", label: "Last name", description: "Contact last name" },
  { tag: "email", label: "Email", description: "Contact email address" },
] as const;

export const RESERVED_MERGE_TAGS = [
  {
    tag: "unsubscribeUrl",
    label: "Unsubscribe URL",
    description: "Preference page for this recipient",
  },
  {
    tag: "physicalAddress",
    label: "Physical address",
    description: "CAN-SPAM postal address",
  },
  {
    tag: "listName",
    label: "List name",
    description: "Campaign audience list name",
  },
  {
    tag: "workspaceName",
    label: "Workspace name",
    description: "Workspace display name",
  },
  {
    tag: "currentYear",
    label: "Current year",
    description: "Send-time calendar year",
  },
] as const;

export type ContactMergeTag = (typeof CONTACT_MERGE_TAGS)[number]["tag"];
export type ReservedMergeTag = (typeof RESERVED_MERGE_TAGS)[number]["tag"];

export const ALL_MERGE_TAGS = [...CONTACT_MERGE_TAGS, ...RESERVED_MERGE_TAGS];

export const PHASE2_KNOWN_MERGE_TAG_NAMES = new Set<string>([
  ...CONTACT_MERGE_TAGS.map((entry) => entry.tag),
  ...RESERVED_MERGE_TAGS.map((entry) => entry.tag),
]);

const MERGE_TAG_PATTERN = /\{\{([^{}]+)\}\}/g;

export function extractMergeTagNames(text: string): string[] {
  const names: string[] = [];
  for (const match of text.matchAll(MERGE_TAG_PATTERN)) {
    const name = match[1]?.trim();
    if (name) {
      names.push(name);
    }
  }
  return names;
}

export function findUnknownMergeTags(
  texts: string[],
  knownTags: ReadonlySet<string> = PHASE2_KNOWN_MERGE_TAG_NAMES,
): string[] {
  const unknown = new Set<string>();

  for (const text of texts) {
    for (const tag of extractMergeTagNames(text)) {
      if (!knownTags.has(tag)) {
        unknown.add(tag);
      }
    }
  }

  return [...unknown].sort();
}

export function formatMergeTag(tag: string): string {
  return `{{${tag}}}`;
}
