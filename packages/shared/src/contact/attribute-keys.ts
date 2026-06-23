import { CONTACT_ATTRIBUTE_KEY_PATTERN } from "../constants/contact";
import { CONTACT_MERGE_TAGS, RESERVED_MERGE_TAGS } from "../template/merge-tags";

export function isValidContactAttributeKey(key: string): boolean {
  return CONTACT_ATTRIBUTE_KEY_PATTERN.test(key);
}

export function buildKnownMergeTagNames(attributeKeys: string[]): Set<string> {
  const known = new Set<string>([
    ...CONTACT_MERGE_TAGS.map((entry) => entry.tag),
    ...RESERVED_MERGE_TAGS.map((entry) => entry.tag),
    ...attributeKeys.filter(isValidContactAttributeKey),
  ]);
  return known;
}
