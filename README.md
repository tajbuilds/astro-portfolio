# Taj | Solutions Architect Portfolio

Architecture-first portfolio built with Astro and deployed on Cloudflare.

This repo powers https://tajs.io and is focused on case studies across edge, automation, and data/search systems.

## Tech Stack

- Astro (TypeScript)
- Cloudflare Workers + static assets
- Cloudflare R2 (private media storage via API)
- Astro content collections for Work and Blog
- Decap CMS + GitHub OAuth bridge
- Giscus (GitHub Discussions comments)
- Minimal client-side JavaScript (performance-first)

## Information Architecture

- Home: portfolio-first overview
- Work: case studies and tags
- Work detail: structured architecture write-ups
- About: background and focus areas
- Blog: currently marked as coming soon
- Contact: Turnstile-protected form + Resend delivery

## Local Development

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

Runtime secrets are configured in Cloudflare Dashboard (not committed):

- `RESEND_API_KEY`
- `TURNSTILE_SITE_SECRET`
- `MEDIA_UPLOAD_TOKEN`

Optional runtime vars:

- `GISCUS_REPO` (e.g. `tajbuilds/astro-portfolio`)
- `GISCUS_REPO_ID`
- `GISCUS_CATEGORY`
- `GISCUS_CATEGORY_ID`
- `GISCUS_LANG` (default: `en`)

Public/non-secret runtime vars are stored in `wrangler.json`.

## Content

- Work case studies: `src/content/work/*`
- Blog posts: `src/content/blog/*`
- Architecture diagrams: `public/diagrams/*`

## Private R2 Media

R2 is bound to the Worker as `MEDIA_BUCKET` (bucket: `portfolio`) and remains private.

- Upload endpoint (token-protected): `POST /api/media/upload`
- List endpoint (token/cookie-protected): `GET /api/media/list`
- Delete endpoint (token/cookie-protected): `DELETE /api/media/<key>`
- Read endpoint (streams from private R2): `GET /api/media/<key>`

Upload request requirements:

- Auth via either:
  - `Authorization: Bearer <MEDIA_UPLOAD_TOKEN>`, or
  - HttpOnly `cms_media_token` cookie (set after Decap OAuth login)
- `multipart/form-data` with `file` field
- Optional fields: `collection`, `folder`, `name`
- Folder root is restricted to: `blog`, `work`, `shared`
  - Example paths: `blog/hero`, `work/diagrams`, `shared/avatar`

## CMS (Decap)

A browser-based editor is available at `/admin`.

- Admin app: `public/admin/index.html`
- CMS config: `public/admin/config.yml`
- Content targets: `src/content/blog` and `src/content/work`

Local CMS testing:

```bash
npx decap-server
```

Then open:

- Site: `http://localhost:4321`
- Admin: `http://localhost:4321/admin`

Production auth:

- The config uses the GitHub backend (`tajbuilds/astro-portfolio`).
- For production login on a Cloudflare-hosted site, configure a GitHub OAuth proxy/bridge compatible with Decap and protect `main` with branch rules.

## Blog Comments (Giscus)

Blog post comments are powered by Giscus and only render when all required vars above are set.

## Security and Privacy

- No private keys or service secrets are committed.
- Case-study technical details are sanitized/generalized.
- See [SECURITY.md](./SECURITY.md) for reporting guidance.

## License

MIT. See [LICENSE](./LICENSE).
