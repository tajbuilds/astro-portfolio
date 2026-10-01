# Native Android API Handoff (Astro Portfolio)

This document reflects the GitBook-backed **mobile API v2** implemented in this repository.

## Goal

Expose stable JSON endpoints for native Android consumption so the app does not parse HTML pages.

## Implemented Endpoints

- `GET /api/mobile/home`
- `GET /api/mobile/work`
- `GET /api/mobile/work/[slug]`
- `GET /api/mobile/about`
- `GET /api/mobile/contact`
- `GET /api/mobile/privacy`

All endpoints return JSON.

## Exact Reachability

### Local (dev)

- `http://localhost:4321/api/mobile/home`
- `http://localhost:4321/api/mobile/work`
- `http://localhost:4321/api/mobile/work/edge-cache-api-proxy`
- `http://localhost:4321/api/mobile/about`
- `http://localhost:4321/api/mobile/contact`
- `http://localhost:4321/api/mobile/privacy`

### Production

- `https://tajs.io/api/mobile/home`
- `https://tajs.io/api/mobile/work`
- `https://tajs.io/api/mobile/work/edge-cache-api-proxy`
- `https://tajs.io/api/mobile/about`
- `https://tajs.io/api/mobile/contact`
- `https://tajs.io/api/mobile/privacy`

## Work Discovery

Work slugs are no longer registered in this repository. They are discovered from direct children of the private GitBook `Projects` hierarchy.

The current representative project is:

- `edge-cache-api-proxy`

Adding/removing a GitBook project changes the mobile work collection without a code change.

## Response Rules

Implemented across all endpoints:

- `Content-Type: application/json; charset=utf-8`
- `version: "2.0"` in root
- `generatedAt` as ISO timestamp (UTC)
- `404` for unknown work slug
- `500` safe error on unexpected failures

Standard error shape:

```json
{
  "version": "2.0",
  "error": {
    "code": "not_found",
    "message": "Work item not found"
  }
}
```

## Data Contract

### `GET /api/mobile/home`

Returns:

- `profile` (name, role, tagline, avatarUrl, location)
- `featuredWork[]` (same summary shape as work list)
- `cta.primary` and `cta.secondary`

### `GET /api/mobile/work`

Returns GitBook-discovered `items[]` with:

- `slug`
- `title`
- `summary`
- `tags[]`
- `role`
- `timeline` — nullable; GitBook currently exposes no authoritative project timeline
- `coverImageUrl` — default portfolio cover until CMS media metadata is introduced
- `publishedAt` — nullable; GitBook currently exposes no authoritative per-project publication date
- `updatedAt` — nullable; GitBook currently exposes no authoritative per-project update date
- `href` — public `/work/<project>/` route

### `GET /api/mobile/work/[slug]`

Returns `item` with all summary fields, plus:

- `content.format` = `"markdown"`
- `content.body` — GitBook project-root Markdown
- compatibility `sections.context`
- compatibility `sections.constraints`
- compatibility `sections.approach`
- compatibility `sections.outcome`
- compatibility `sections.learnings`
- `pages[]` — ordered GitBook child-page navigation with `title`, `summary`, `path`, and public `href`
- `links.liveDemo` — nullable
- `links.repository` — nullable

The compatibility `sections` object is derived from conventional level-two headings in the project-root Markdown. New mobile clients should prefer `content.body` plus `pages[]` for the complete CMS-backed case study.

### `GET /api/mobile/about`

Returns:

- `about` with:
  - `name`
  - `headline`
  - `bio`
  - `skills[]`
  - `focusAreas[]`
  - `avatarUrl`
  - `social[]`

### `GET /api/mobile/contact`

Returns:

- `contact.email`
- `contact.formPath` (`/api/contact`)
- `contact.turnstileRequired`
- `contact.links[]`

### `GET /api/mobile/privacy`

Returns:

- `privacy.lastUpdated`
- `privacy.introduction[]`
- `privacy.sections[]` (policy sections, nested headings, paragraphs, bullets)
- `privacy.contact` (`name`, `website`, `email`)

## Caching

Read endpoints send:

- `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`

Error responses send:

- `Cache-Control: no-store`

## Validation Commands

```bash
curl -s http://localhost:4321/api/mobile/home | jq
curl -s http://localhost:4321/api/mobile/work | jq
curl -s http://localhost:4321/api/mobile/work/edge-cache-api-proxy | jq
curl -s http://localhost:4321/api/mobile/about | jq
curl -s http://localhost:4321/api/mobile/contact | jq
curl -s http://localhost:4321/api/mobile/privacy | jq
```

## File Map

Implemented files:

- `src/lib/mobile-api.ts`
- `src/pages/api/mobile/home.ts`
- `src/pages/api/mobile/work.ts`
- `src/pages/api/mobile/work/[slug].ts`
- `src/pages/api/mobile/about.ts`
- `src/pages/api/mobile/contact.ts`
- `src/pages/api/mobile/privacy.ts`

## Android Consumer Expectations

- Endpoint paths remain stable.
- `version` and `generatedAt` are always present.
- `content.format` is `markdown`.
- Work discovery and detail content come from GitBook.
- Unsupported historical metadata is explicitly `null`; values are not fabricated.
- Contract-breaking payload changes require an API version bump.
