# Block render registry keyed by discriminator

Email block rendering uses a type-keyed registry in `@repo/email-renderer`, not free-standing `switch` statements duplicated across HTML and plain-text paths. Each block type registers once; `renderContentBlock` and `renderContentBlockText` dispatch through the registry. Vitest tests cover every block type with shared fixtures.

**Considered:** Codegen from Zod schema. Deferred — registry + tests give enough drift protection for current block count.

**Consequences:** Adding a block type requires: Zod schema in `@repo/shared`, registry entry in email-renderer, test fixture. See `CONTEXT.md` → **Block type**.
