# Local development

## Run the app

```sh
pnpm dev:app
```

Starts `api` and `web` only.

## Package changes need a build

Workspace packages (`@repo/shared`, `@repo/email-renderer`, `@repo/db`, etc.) export compiled output from `dist/`. `dev:app` does **not** watch or rebuild them.

After editing code under `packages/`, rebuild the package (or its dependents) before expecting changes in `api` / `web`:

```sh
# One package
pnpm --filter @repo/email-renderer build

# Package + everything that depends on it
pnpm build --filter=@repo/email-renderer...

# All packages
pnpm build
```

Then restart `pnpm dev:app` if the API already loaded stale `dist/` output.

**Optional:** run a package watcher in a second terminal while developing:

```sh
pnpm --filter @repo/email-renderer dev
```

(`tsc --watch` — same for `@repo/shared`, `@repo/db`.)

## Tests

Package unit tests use source directly; they do not replace rebuilding for the running app:

```sh
pnpm --filter @repo/email-renderer test
pnpm --filter web test
```
