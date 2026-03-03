# Taj | Solutions Architect Portfolio

Architecture-first portfolio built with Astro and deployed on Cloudflare Workers.

This repository powers https://tajs.io and showcases structured case studies across edge computing, automation platforms, and search/data systems.

## Tech Stack

- Astro (TypeScript)
- Cloudflare Workers (edge runtime + static assets)
- Cloudflare R2 (private media storage via Worker API)
- Astro Content Collections (Work, Blog)
- Decap CMS (GitHub backend)
- Giscus (GitHub Discussions-powered comments)
- Minimal client-side JavaScript (performance-first approach)

## Information Architecture

- Home - Portfolio-first overview
- Work - Case studies with tags and categorisation
- Work Detail - Structured architecture write-ups
- About - Background and technical focus areas
- Blog - Currently marked as coming soon
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

## Optional Runtime Variables

- `GISCUS_REPO` (e.g. `tajbuilds/astro-portfolio`)
- `GISCUS_REPO_ID`
- `GISCUS_CATEGORY`
- `GISCUS_CATEGORY_ID`
- `GISCUS_LANG` (default: `en`)

Public, non-secret runtime variables are defined in `wrangler.json`.

## Content Structure

- Work case studies -> `src/content/work/*`
- Blog posts -> `src/content/blog/*`
- Architecture diagrams -> `public/diagrams/*`

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

- `blog`
- `work`
- `shared`

Example paths:

- `blog/hero`
- `work/diagrams`
- `shared/avatar`

### Read Endpoint

`GET /api/media/<key>`

Streams private R2 objects through the Worker.

## CMS (Decap)

A browser-based editor is available at:

- `/admin`

- Admin app -> `public/admin/index.html`
- CMS config -> `public/admin/config.yml`
- Content targets -> `src/content/blog`, `src/content/work`

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

## Blog Comments (Giscus)

Blog comments are powered by Giscus and render only when all required runtime variables are configured.

## Security and Privacy

- No private keys or service secrets are committed.
- Case-study technical details are sanitised and generalised.
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting guidance.

## License

MIT - see [LICENSE](./LICENSE).
