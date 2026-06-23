const LIST_MEMBERSHIP_STATUSES = [
  "subscribed",
  "pending",
  "unsubscribed",
] as const;

const CONTACT_IMPORT_STATUSES = [
  "pending_confirmation",
  "processing",
  "completed",
  "failed",
] as const;

const CONTACT_IMPORT_SYNC_ROW_CAP = 1_000;

const LIST_CONFIRM_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const CONTACT_ATTRIBUTE_KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const CONTACT_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024;

export {
  LIST_MEMBERSHIP_STATUSES,
  CONTACT_IMPORT_STATUSES,
  CONTACT_IMPORT_SYNC_ROW_CAP,
  LIST_CONFIRM_TOKEN_TTL_MS,
  CONTACT_ATTRIBUTE_KEY_PATTERN,
  CONTACT_IMPORT_MAX_FILE_BYTES,
};
