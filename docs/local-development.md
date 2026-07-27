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

## Object storage (images / logos)

Uploads use an S3-compatible client. **Cloudflare R2** and **Amazon S3** share the same adapter — switch with env only.

```sh
# none | s3 | r2  (r2 and s3 use the same implementation)
OBJECT_STORAGE_DRIVER=r2
OBJECT_STORAGE_BUCKET=your-bucket
OBJECT_STORAGE_PUBLIC_BASE_URL=https://assets.yourdomain.com
OBJECT_STORAGE_ACCESS_KEY_ID=...
OBJECT_STORAGE_SECRET_ACCESS_KEY=...

# R2: account endpoint (required). Region defaults to "auto".
OBJECT_STORAGE_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com

# AWS S3: leave ENDPOINT unset; set REGION (e.g. us-east-1).
# OBJECT_STORAGE_DRIVER=s3
# OBJECT_STORAGE_REGION=us-east-1

# Optional. Defaults to true when ENDPOINT is set.
# OBJECT_STORAGE_FORCE_PATH_STYLE=true
```

`OBJECT_STORAGE_PUBLIC_BASE_URL` must be a **stable public URL** prefix (custom domain or R2 public bucket URL). Email HTML stores that URL permanently — do not use short-lived signed URLs.

Without config (`DRIVER=none` or unset), the API starts fine; upload returns 503 until storage is configured.

## Tests

Package unit tests use source directly; they do not replace rebuilding for the running app:

```sh
pnpm --filter @repo/email-renderer test
pnpm --filter web test
```
