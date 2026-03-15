# Taj | Solutions Architect Portfolio

Architecture-first portfolio built with Astro and deployed on Cloudflare Workers.

This repository powers https://tajs.io and showcases structured case studies across edge computing, automation platforms, and search/data systems.

## Tech Stack

- Astro (TypeScript)
- Cloudflare Workers (edge runtime + static assets)
- Cloudflare R2 (private media storage via Worker API)
- Astro Content Collections (Work)
- Decap CMS (GitHub backend)
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

- Work case studies -> `src/content/work/*`
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

- `work`
- `shared`

Example paths:

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
- Content target -> `src/content/work`

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

Shared portfolio data and collection accessors live in `src/lib/data/portfolio-data.ts`.
Both web pages and `/api/mobile/*` endpoints consume this layer to keep contracts stable.

## Security and Privacy

- No private keys or service secrets are committed.
- Case-study technical details are sanitised and generalised.
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting guidance.

## Docs Plan (Checkpoint)

Date: March 15, 2026  
Goal: Keep this as the single source of truth for what exists, what’s fixed, and what we’ll build next.

### Vision

1. Portfolio stays primary on `tajs.io`.
2. Long-form case-study docs live under `/docs/*`.
3. Docs content is runtime-driven from D1.
4. Outline remains authoring source; sync worker pushes to D1.
5. No docs framework should control root routing.

### What is already implemented

1. `/docs/case-studies/[...slug]` is DB-driven (D1).
2. D1 hierarchy now works as parent/child:
- One case study row
- Multiple child documents under that case study
3. Sync worker patched with root strategy support:
- `root_mode=collection`
- `root_mode=single`
4. Smart Edge case study link from `/work` now points to valid unified slug:
- `/docs/case-studies/smart-edge-cache-proxy/`
5. Work cards are clickable again.
6. Docs typography improved and applied correctly to DB-injected markdown (`:global` fix).
7. Mermaid rendering is global and theme-aware, with improved dark/light contrast.

### Current architecture (live)

1. Astro app routes:
- `/` portfolio
- `/work` short case studies
- `/docs/case-studies/...` long docs
2. Cloudflare Workers runtime with D1 binding `DB`.
3. D1 content model:
- `case_studies`
- `documents`
- plus sync tracking tables.
4. Outline sync worker (separate repo) pushes docs into D1 on manual trigger.

### Authoring + sync workflow (current)

1. Write/update content in Outline.
2. Trigger manual sync:
- `POST https://sync.tajs.io/sync/start?mode=sync&root_mode=single` (for one parent case with many sections)
3. Verify in D1:
- 1 visible case study for parent
- multiple docs with depth > 0
4. Portfolio short case-study entry links to case-study slug in `/docs/case-studies/<slug>/`.

### Known limitations right now

1. Docs UX is good but not yet “Starlight-level polish”.
2. Search is not fully productized.
3. Tags/related-doc behavior is basic.
4. Mermaid is better but may need one more palette tuning iteration.

### What we decided not to do

1. Not using Starlight as the main engine (route/content model mismatch for DB runtime approach).
2. Not using Fumadocs in Astro stack (compatibility/runtime mismatch).
3. Not moving long docs back to local MD files.

### Build plan for later

### Phase 1: Solid Docs Product Surface

1. Create proper `/docs` landing page:
- sections
- featured case studies
- recently updated
2. Improve sidebar tree UX:
- active trail
- nested indentation rules
- better mobile behavior
3. Improve right rail:
- sticky TOC
- heading spy/highlight
4. Add breadcrumbs on docs pages.

### Phase 2: Metadata + Discovery

1. Add `doc_tags` relational table.
2. Add tag listing pages:
- `/docs/tag/<tag>`
3. Add related-docs logic:
- by tags + section + optional manual links.
4. Add “Read next” block at doc bottom.

### Phase 3: Search

1. Start with D1 search endpoint (`/api/docs/search`).
2. Add search UI in docs shell.
3. If needed, move to Meilisearch for better ranking/speed.

### Phase 4: Publishing Discipline

1. Define naming and structure convention in Outline:
- parent page = case study
- subpages = sections
2. Keep manual sync trigger.
3. Add lightweight validation checklist post-sync.

### Validation checklist after each sync

1. Case study exists and visible:
```sql
SELECT slug, title, is_visible FROM case_studies ORDER BY nav_order, title;
```
2. Parent-child shape is correct:
```sql
SELECT cs.slug, COUNT(d.id) docs_total, SUM(CASE WHEN d.is_root=1 THEN 1 ELSE 0 END) root_docs, MAX(d.depth) max_depth
FROM case_studies cs LEFT JOIN documents d ON d.case_study_id=cs.id
WHERE cs.is_visible=1
GROUP BY cs.id, cs.slug
ORDER BY cs.nav_order, cs.title;
```
3. Slug link to use from `/work`:
- `/docs/case-studies/<case_studies.slug>/`

### Repos involved

1. Portfolio app:
- `/home/taj/dev/astro-portfolio`
2. Sync worker:
- `/home/taj/dev/outline-d1-sync-worker`
- Git: `github.com/tajbuilds/cf-outline-d1-sync-worker`

### Critical environment/settings to remember

1. Portfolio needs D1 binding `DB` in its Wrangler config.
2. Sync worker vars:
- `OUTLINE_BASE_URL`
- `OUTLINE_CASE_STUDIES_ROOT_ID`
- `OUTLINE_ROOT_MODE` (`single` or `collection`)
3. Sync worker secret:
- `OUTLINE_API_TOKEN`
4. Access to sync endpoint protected by Zero Trust at edge.

### If we resume after days

1. First check live route:
- `/docs/case-studies/smart-edge-cache-proxy/`
2. Check latest sync status:
- `GET https://sync.tajs.io/sync/latest`
3. Run 2 SQL validation queries above.
4. Continue from Phase 1 task list.

## License

MIT - see [LICENSE](./LICENSE).
