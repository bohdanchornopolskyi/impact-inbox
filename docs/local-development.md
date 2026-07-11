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

## Database

Start Postgres (and Redis) from `packages/db`:

```sh
docker compose -f packages/db/docker-compose.yml up -d
```

Default URL: `postgresql://dev:dev@localhost:5432/email_platform` (`DATABASE_URL`).

**Local only:** sync schema with push. Do not generate or commit migrations, and do not add CI migrate workflows.

```sh
pnpm --filter @repo/db db:push
```

See [deferred-work §5](./deferred-work.md#5-drizzle-migrations--ci-migrate).

## Tests

Package unit tests use source directly; they do not replace rebuilding for the running app:

```sh
pnpm --filter @repo/email-renderer test
pnpm --filter web test
```
