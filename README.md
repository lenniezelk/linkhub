<div align="center">
  <img src="public/logo512.png" alt="LinkHub Logo" width="120" />
  
  # LinkHub
  <strong>Unified personal hub for managing, sharing, and showcasing your digital presence.</strong>
  <br />
  <em>Built on Cloudflare Workers + TanStack React Start + Drizzle ORM (D1)</em>
</div>

---

## Overview

LinkHub provides user signup/login (local + OAuth via Google), handle claiming, and a foundation for storing and presenting user-centric link/profile data (extensible). It leverages Cloudflare's edge runtime for fast global performance, a D1 database for persistence, and modern React 19 with TanStack Router for file‑based routing and progressive enhancement.

## Key Features

- React 19 + TanStack React Start (SSR + streaming)
- File-based routing via `@tanstack/react-router`
- Cloudflare Workers deployment (`wrangler`), edge‑compatible code (no Node‑only APIs)
- D1 (SQLite) database with Drizzle ORM & migrations
- Secure password hashing (PBKDF2 via WebCrypto) + JWT auth (JOSE)
- Google OAuth (via `@react-oauth/google`)
- Tailwind CSS v4 for styling
- Biome for linting/formatting
- Type-safe environment bindings in dev using `wrangler` platform proxy
- Rive animations (`@rive-app/react-canvas`)

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Cloudflare Workers (edge) |
| Framework | TanStack React Start + React 19 |
| Routing | `@tanstack/react-router` (file-based) |
| DB | Cloudflare D1 (SQLite) + Drizzle ORM |
| Auth | PBKDF2 password hashing + JWT (HS256) + Google OAuth |
| Styling | Tailwind CSS 4 |
| Dev Tooling | Vite 6, Biome, Vitest, TypeScript 5.7 |

## Monorepo / Structure Snapshot

```
src/
  routes/           # File-based routes (SSR aware)
  components/       # Reusable UI components
  lib/
    auth.ts         # Hashing + JWT helpers
    cf_bindings.ts  # Edge env bindings loader (dev vs prod)
    db/             # Drizzle client + schema
  styles.css        # Tailwind entry
drizzle/            # Generated SQL migrations + journal
drizzle.config.ts   # Drizzle kit configuration
wrangler.jsonc      # Cloudflare Worker + env bindings
```

## Quick Start (Local Development)

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000

### Prerequisites

- Node.js 20+ (Cloudflare Workers use modern runtime semantics)
- A Cloudflare account with D1 database(s) provisioned (for remote/staging/prod)
- `wrangler` configured (login via `pnpm wrangler login` if needed)

## Environment & Secrets

Edge runtime secrets are injected via `wrangler.jsonc` `vars` for staging/production. For **local dev**, the project uses a baked-in development fallback JWT secret in `auth.ts` unless you override it.

Recommended `.env` variables (used by Drizzle generation):

```
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_DATABASE_ID=xxxxx
CLOUDFLARE_D1_TOKEN=cf_d1_api_token
```

Never commit real production secrets to version control. Rotate any secrets appearing in history before launch.

## Database (D1 + Drizzle)

Schema file: `src/lib/db/schema.ts`

Current tables:

- `users`
  - `id` (UUID primary key)
  - `email` (unique, required)
  - `name` (required)
  - `password_hash` (nullable for OAuth users)
  - `handle` (unique, optional)
  - `created_at` (timestamp)
  - `emailVerified` (boolean)

### Migrations Workflow

Generate migration SQL from schema changes:

```bash
pnpm db-generate
```

Apply migrations locally (Miniflare / D1 preview):

```bash
pnpm db:local:migrate
```

Reset local D1 (drops preview data):

```bash
pnpm db:local:reset
```

Apply to staging:

```bash
pnpm db:staging:migrate
```

Apply to production:

```bash
pnpm db:prod:migrate
```

Open Drizzle Studio (schema explorer):

```bash
pnpm db:local:studio
```

Run ad-hoc SQL query locally:

```bash
pnpm db:local:query -- "SELECT * FROM users LIMIT 5;"
```

## Auth Flow

1. User registers (local): password hashed via PBKDF2 (100k iterations, SHA‑256) -> stored as `iterations:salt:hash`.
2. JWT created with `HS256` using secret from env (`JWT_SECRET`) and returned/stored (implementation detail: token generation in `auth.ts`).
3. OAuth (Google) users skip password hash; `handle` can be claimed later.
4. Verification uses same PBKDF2 parameters to re-derive and constant-time compare.

### JWT Notes
- Expiration: 7 days
- Claims: `sub`, `email`, `name`, `handle`
- Rotate `JWT_SECRET` carefully; consider multi-key support if adding key rotation later.

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start Vite dev server (edge SSR emulation) |
| `pnpm build` | Build server + client bundles (`.output/`) |
| `pnpm start` | Run built worker locally (after build) |
| `pnpm serve` | Vite preview static serve |
| `pnpm deploy:staging` | Build, migrate staging DB, deploy worker (staging env) |
| `pnpm deploy:prod` | Build then deploy to production (no auto-migrate prod DB except included step) |
| `pnpm cf-typegen` | Generate `Env` type from Wrangler config |
| `pnpm generate-wrangler` | Regenerate wrangler config (script scaffolding) |
| `pnpm db-generate` | Drizzle kit generate migrations |
| `pnpm db:local:migrate` | Apply migrations to local preview DB |
| `pnpm db:local:reset` | Reset local DB (dangerous) |
| `pnpm db:staging:migrate` | Apply migrations to staging D1 |
| `pnpm db:prod:migrate` | Apply migrations to production D1 |
| `pnpm test` | Run Vitest test suite |
| `pnpm lint` | Biome lint |
| `pnpm lint:fix` | Lint with auto-fix |
| `pnpm format` | Format code |
| `pnpm check` | Combined lint + format check |
| `pnpm clean` | Remove build artifacts |
| `pnpm reset` | Full clean + reinstall deps |

## Development Notes

- `cf_bindings.ts` initializes Cloudflare platform proxy only in dev (`import.meta.env.DEV`). Avoid using Node core modules not polyfilled by Workers.
- React context errors (e.g., `Invalid hook call`) can occur if multiple React instances get bundled; ensure only one `react` version is installed (pnpm should dedupe). Delete `.vite` cache if symptoms persist: `rm -rf node_modules/.vite`.

## Troubleshooting

### Esbuild "Could not resolve 'sqlite'" during dev
`wrangler` internally references an optional `sqlite` dependency for local tooling. In a Vite SSR bundle, this may surface. Workarounds:
1. Mark it external in Vite config (already partially addressed if you updated config):
   ```ts
   optimizeDeps: { exclude: ['sqlite'] },
   ssr: { external: ['sqlite'] }
   ```
2. Ignore: Cloudflare Workers runtime does not require the native `sqlite` package—D1 is HTTP based.
3. If persists, pin wrangler version or clear cache: `pnpm clean && pnpm install`.

### Binding Initialization Errors
If you see: `Dev bindings not initialized yet. Call initDevEnv() first.` ensure `cf_bindings.ts` executed on server side only (avoid importing inside purely client components early).

### JWT Secret Errors
If `JWT_SECRET` length < 32 or missing, token creation will throw. Set a secure random hex string.

## Testing

Run all tests:

```bash
pnpm test
```

Add vitest + Testing Library tests under `src/` or a `tests/` directory. Example patterns: `*.test.ts(x)`.

## Linting & Formatting

Biome provides unified lint + format:

```bash
pnpm lint
pnpm format
pnpm check   # CI style aggregate
```

## Deployment

Staging:
```bash
pnpm deploy:staging
```
Production:
```bash
pnpm deploy:prod
```

Ensure migrations are applied / safe before production deployment. Consider manual approval for prod DB changes.

## Future Roadmap (Ideas)

- User link collections & ordering
- Public profile pages with analytics (click counts)
- Email verification workflow
- Password reset & session revocation
- Rate limiting / abuse protection (KV or R2 + durable object token bucket)
- Audit logging (open telemetry / analytics events)
- Theming & custom domains

## License

Proprietary (default). Add a LICENSE file if you intend to open-source.

## Acknowledgements

- TanStack React Start & Router
- Cloudflare Workers & D1
- Drizzle ORM
- Rive
- Biome, Vitest, Tailwind

---

Happy building! 🚀
