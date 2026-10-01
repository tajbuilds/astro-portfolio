# Taj | Solutions Architect Portfolio

Architecture-first portfolio built with Astro and deployed on Cloudflare Workers.

This repository powers https://tajs.io and renders portfolio projects and long-form case studies from a private GitBook CMS.

## Tech Stack

- Astro + TypeScript
- Cloudflare Workers
- GitBook as the private headless portfolio CMS
- Marked for server-rendered Markdown
- Mermaid for architecture diagrams
- Minimal client-side JavaScript

## Content Architecture

GitBook is the single source of truth for portfolio content.

```text
GitBook
  -> src/lib/gitbook/*
  -> Astro / Cloudflare Worker
  -> /work/<project>/...
```

A direct child of the configured GitBook `Projects` root is a public portfolio project.

Project-root tags drive portfolio behaviour:

- `showcase` is reserved metadata controlling homepage eligibility;
- all other project-root tags are public taxonomy used by Work filters and tag routes.

Adding, removing, renaming or reclassifying a portfolio project should not require a code change.

## Public Routes

- `/` — portfolio homepage
- `/work/` — GitBook-driven project listing
- `/work/<project>/` — project overview
- `/work/<project>/<page>/` — project documentation
- `/work/tags/<tag>/` — GitBook-driven tag filtering
- `/about/`
- `/contact/`
- `/privacy/`
- `/sitemap.xml` — runtime sitemap generated from GitBook

Legacy `/docs/*` URLs are permanent redirects into the public `/work/*` hierarchy.

## Local Development

Install dependencies:

```bash
npm install
```

For normal Astro development:

```bash
npm run dev
```

For GitBook-backed runtime testing, copy the local environment template and set the private GitBook token:

```bash
cp .dev.vars.example .dev.vars
npm run preview
```

The non-secret GitBook space ID is defined in `wrangler.json`; the adapter uses `projects` as its built-in portfolio root. The GitBook token must remain a Cloudflare secret or local `.dev.vars` value and must never be committed.

## Validation

Focused tests:

```bash
npm run test:gitbook
npm run test:mobile
```

Production checks:

```bash
npm run build
npm run check
```

## Deployment

Cloudflare deployment uses Wrangler:

```bash
npm run deploy
```

Runtime secrets configured outside the repository:

- `GITBOOK_TOKEN`
- `RESEND_API_KEY`
- `TURNSTILE_SITE_SECRET`

Public runtime variables are defined in `wrangler.json`.

## Mobile API

The mobile Work API reads the same normalized GitBook project model as the website.

Stable endpoints:

- `GET /api/mobile/home`
- `GET /api/mobile/work`
- `GET /api/mobile/work/[slug]`
- `GET /api/mobile/about`
- `GET /api/mobile/contact`
- `GET /api/mobile/privacy`

The current Work payload contract is version `2.0`. See `docs/native-android-api-handoff.md`.

## Repository Structure

- `src/lib/gitbook/*` — GitBook client, mapping and portfolio queries
- `src/components/DocumentationReader.astro` — shared long-form reader UI
- `src/components/GitBookDocumentationReader.astro` — GitBook-to-reader adapter
- `src/lib/data/site-data.ts` — non-project static site/profile/privacy data
- `src/pages/work/*` — public portfolio routes
- `src/pages/docs/*` — permanent legacy redirects only
- `public/scripts/documentation-mermaid.js` — Mermaid progressive enhancement
- `docs/gitbook-cms-migration-plan.md` — migration and architectural decision record

## Security and Privacy

- No private keys, API tokens or service secrets are committed.
- GitBook credentials remain server-side.
- Original project/case-study content is sanitised for public release.
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting guidance.

## License

MIT - see [LICENSE](./LICENSE).
