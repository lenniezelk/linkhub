<div align="center">
  <img src="src/assets/logo.svg" alt="LinkHub Logo" width="120" />
  
  # LinkHub
  <strong>Unified personal hub for managing, sharing, and showcasing your digital presence.</strong>
  <br />
  <em>Built on Cloudflare Workers + TanStack React Start + Drizzle ORM (D1)</em>
  
  <br />
  <br />
  
  🚀 **[View Live Production Site](https://linkhub-2-production.lkioi.workers.dev/)**
</div>

---

## Overview

LinkHub is a modern social link aggregation platform that allows users to create personalized profile pages with their social media links, contact information, and custom themes. Built with React 19 and deployed on Cloudflare Workers for global edge performance.

**Current Features:**
- User authentication (email/password + Google OAuth)
- Personalized profile pages (`linkhub.com/l/username`)
- Social media link management (Instagram, Twitter, LinkedIn, etc.)
- Profile image upload and management
- Custom themes and styling
- Email verification system
- Account management dashboard
- Responsive design with modern UI components

## Key Features

### 🚀 Core Platform
- **React 19** + TanStack React Start (SSR + streaming)
- **File-based routing** via `@tanstack/react-router`
- **Cloudflare Workers** deployment for global edge performance
- **Type-safe development** with TypeScript 5.7

### 🔐 Authentication & Security
- **Secure password hashing** (PBKDF2 with 100k iterations)
- **JWT-based sessions** with 7-day expiration
- **Google OAuth integration** for seamless signup
- **Email verification** system
- **Password complexity requirements** (letters, numbers, special characters)

### 📊 Data & Storage
- **D1 (SQLite)** database with Drizzle ORM
- **Automatic migrations** and schema management
- **Profile image storage** with multiple variants
- **Custom themes** and user preferences
- **Social link management** across platforms

### 🎨 UI & Design
- **Tailwind CSS 4** for modern styling
- **Responsive design** for all devices
- **Custom theme system** with gradient backgrounds
- **Rive animations** for enhanced UX
- **Component-based architecture** with reusable UI elements

### 🛠️ Developer Experience
- **Biome** for linting and formatting
- **Vitest** for testing
- **Type-safe environment** bindings
- **Hot module replacement** in development

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

## Project Structure

```
src/
  routes/              # File-based routes (SSR aware)
    app.account.tsx     # Account management dashboard
    app.create-handle.tsx # Handle claiming
    app.index.tsx       # Main dashboard
    auth.login.tsx      # Login page
    auth.signup.tsx     # Registration page
    l.$handle.tsx       # Public profile pages
    pricing.tsx         # Pricing information
  components/          # Reusable UI components
    Button.tsx
    Input.tsx
    ProfileImageEdit.tsx
    SectionHeading.tsx
    EmailVerification.tsx
    # ... and more
  lib/
    auth.ts            # Password hashing + JWT helpers
    cf_bindings.ts     # Edge environment bindings
    db/
      dbClient.ts      # Database connection
      schema.ts        # Database schema definitions
    types.ts           # Shared TypeScript types
    validation.ts      # Form validation schemas
  api/                 # Server-side API functions
    profile/           # Profile management APIs
  assets/              # Static assets (images, icons)
  styles.css           # Tailwind CSS entry point
drizzle/              # Database migrations
public/               # Public assets
wrangler.jsonc        # Cloudflare Worker configuration
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

## Database Schema

Schema file: `src/lib/db/schema.ts`

### Current Tables:

**`users`** - User accounts and authentication
- `id` (UUID primary key)
- `email` (unique, required)
- `name` (required)
- `password_hash` (nullable for OAuth users)
- `handle` (unique, optional - claimed separately)
- `created_at` (timestamp)
- `emailVerified` (boolean)

**`links`** - Social media and external links
- `id` (UUID primary key)
- `user_id` (foreign key to users)
- `type` (platform: instagram, twitter, linkedin, etc.)
- `url` (link URL)
- `created_at` (timestamp)

**`profile_images`** - User profile pictures
- `id` (UUID primary key)
- `user_id` (foreign key to users)
- `image_url` (image location)
- `variant` (thumbnail, original, etc.)
- `requires_signed_url` (boolean)
- `created_at` (timestamp)

**`themes`** - Available visual themes
- `id` (UUID primary key)
- `name` (theme name)
- `gradient_class` (CSS class for styling)
- `created_at` (timestamp)

**`user_settings`** - User preferences
- `id` (UUID primary key)
- `user_id` (foreign key to users)
- `theme_id` (foreign key to themes)
- `created_at` (timestamp)

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

## Current Status & Roadmap

### ✅ Completed Features
- User registration and authentication
- Google OAuth integration
- Profile page creation and management
- Social link management
- Profile image upload
- Theme customization
- Email verification
- Account settings dashboard
- Responsive design
- Password security requirements

### 🚧 In Development
- Enhanced analytics for profile views
- Custom domain support
- Advanced theming options
- Link click tracking

### 📋 Future Roadmap
- **Advanced Analytics**
  - Detailed click tracking and insights
  - Visitor analytics and demographics
  - Performance metrics dashboard

- **Customization & Branding**
  - Custom CSS support
  - Brand color customization
  - Logo upload and positioning
  - Advanced layout options

- **Social Features**
  - Profile discovery
  - Featured profiles
  - Social sharing improvements

- **Enterprise Features**
  - Team management
  - Bulk operations
  - Advanced permissions
  - White-label solutions

- **Integrations**
  - API for third-party integrations
  - Webhook support
  - Social media auto-sync
  - Analytics platform integrations

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
