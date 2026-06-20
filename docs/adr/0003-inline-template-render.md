# Render templates from TemplatesService directly

`TemplateRendererService` is removed. `TemplatesService` calls `renderTemplate` from `@repo/email-renderer` directly. Preview policy (parse-before-render, error translation) belongs in `TemplatesService`, not a pass-through Nest provider.

**Considered:** Keep a renderer service for future caching. Rejected — no behavior today; YAGNI until a second adapter (queue worker) needs the same seam.

**Consequences:** `TemplatesModule` drops `TemplateRendererService` from providers. Delete `template-renderer.service.ts`. Send workers reuse `renderTemplate` at delivery with merge tags, footer injection, and link wrapping — see ADR 0005.
