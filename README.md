# Taj | Solutions Architect Portfolio

Architecture-first portfolio built with Astro and deployed on Cloudflare Workers.

This repository powers https://tajs.io and showcases structured case studies across edge computing, automation platforms, and search/data systems.

## Tech Stack

- Astro (TypeScript)
- Cloudflare Workers (edge runtime + static assets)
- Cloudflare R2 (private media storage via Worker API)
- GitBook (private headless portfolio CMS)
- Astro Content Collections (temporary legacy compatibility during migration)
- Minimal client-side JavaScript (performance-first approach)

## Information Architecture

- Home - Portfolio-first overview
- Work - Case studies with tags and categorisation
- Work Detail - Structured architecture write-ups
- About - Background and technical focus areas
- Contact - Turnstile-protected form with Resend delivery

## Local Development

Install dependencies:

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
```

### GitBook CMS local preview

The GitBook migration reads private CMS content at runtime. Keep the API token out of Git:

```bash
cp .dev.vars.example .dev.vars
```

Then set `GITBOOK_TOKEN` in `.dev.vars` and run the Cloudflare runtime preview:

```bash
npm run preview
```

Useful routes:

- `/work/` — GitBook-driven portfolio discovery
- `/work/<project-slug>/` — public project overview
- `/work/<project-slug>/<page>/` — public project documentation

The non-secret GitBook space ID and Projects path are configured in `wrangler.json`. The token must remain a runtime secret/local dev variable.

## Deployment

Cloudflare deployment uses Wrangler:

```bash
npm run deploy
```

## Runtime Secrets (Configured in Cloudflare Dashboard)

These are not committed to the repository:

- `RESEND_API_KEY`
- `TURNSTILE_SITE_SECRET`
- `MEDIA_UPLOAD_TOKEN`

Public, non-secret runtime variables are defined in `wrangler.json`.

## Content Structure

- Portfolio projects and long-form documentation -> private GitBook `Projects` hierarchy
- Architecture diagrams -> `public/diagrams/*`
- `src/content/work/*` -> temporary legacy compatibility only; scheduled for removal after mobile/API migration

## Private R2 Media

R2 is bound to the Worker as `MEDIA_BUCKET` (bucket: `portfolio`) and remains private.

### Upload Endpoint

`POST /api/media/upload`

Authentication via:

- `Authorization: Bearer <MEDIA_UPLOAD_TOKEN>`
- or HttpOnly `cms_media_token` cookie (set after Decap OAuth login)

Request format:

- `multipart/form-data`
- Required field: `file`
- Optional fields: `collection`, `folder`, `name`

Allowed folder roots:

- `work`
- `shared`

Example paths:

- `work/diagrams`
- `shared/avatar`

### Read Endpoint

`GET /api/media/<key>`

Streams private R2 objects through the Worker.

## Legacy CMS Compatibility

The Decap admin surface and `src/content/work` collection remain temporarily for legacy/mobile compatibility during the GitBook migration. They are no longer the portfolio source of truth and will be removed after the remaining consumers are migrated.

- Admin app -> `public/admin/index.html`
- CMS config -> `public/admin/config.yml`
- Legacy content target -> `src/content/work`

### Local CMS Testing

```bash
npx decap-server
```

Then open:

- Site -> `http://localhost:4321`
- Admin -> `http://localhost:4321/admin`

### Production Authentication

Uses GitHub backend (`tajbuilds/astro-portfolio`).

For Cloudflare-hosted production login, configure a GitHub OAuth proxy compatible with Decap and protect the `main` branch with branch protection rules.

## Data Layer

GitBook access is isolated behind `src/lib/gitbook/*`, which provides the normalized project, tag, navigation and page contracts used by the public website.

`src/lib/data/portfolio-data.ts` remains only for temporary legacy/mobile compatibility and is scheduled for removal once those consumers move to the GitBook model.

## Security and Privacy

- No private keys or service secrets are committed.
- Case-study technical details are sanitised and generalised.
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting guidance.

## Portfolio CMS Architecture

GitBook is the single source of truth for public portfolio projects and long-form project documentation.

```text
GitBook
  -> GitBook adapter
  -> Astro / Cloudflare Worker
  -> /work/<project>/...
```

Project-root GitBook tags drive public taxonomy. The reserved `showcase` tag controls homepage eligibility. Astro owns presentation, routing, SEO and rendering; it does not maintain a second project registry.

Legacy `/docs/*` URLs are permanent redirects into the public `/work/*` hierarchy. The previous Outline -> D1 documentation runtime and D1 search endpoint have been retired.

The remaining static Work collection exists only as temporary compatibility for mobile/API and legacy fallback routes. See `docs/gitbook-cms-migration-plan.md` for the active migration sequence and removal gates.

## License

MIT - see [LICENSE](./LICENSE).
