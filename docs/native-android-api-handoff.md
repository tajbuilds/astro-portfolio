# Native Android API Handoff (Astro Portfolio)

This document now reflects the **implemented** mobile API in this repository.

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
- `http://localhost:4321/api/mobile/work/smart-edge-cache-proxy`
- `http://localhost:4321/api/mobile/about`
- `http://localhost:4321/api/mobile/contact`
- `http://localhost:4321/api/mobile/privacy`

### Production

- `https://tajs.io/api/mobile/home`
- `https://tajs.io/api/mobile/work`
- `https://tajs.io/api/mobile/work/smart-edge-cache-proxy`
- `https://tajs.io/api/mobile/about`
- `https://tajs.io/api/mobile/contact`
- `https://tajs.io/api/mobile/privacy`

## Current Work Slugs (as of 2026-03-07)

- `webflow-turnstile-edge-worker-pipeline`
- `faceted-deals-search-engine`
- `smart-edge-cache-proxy`
- `internal-ml-workbench-modernization`

## Response Rules

Implemented across all endpoints:

- `Content-Type: application/json; charset=utf-8`
- `version: "1.0"` in root
- `generatedAt` as ISO timestamp (UTC)
- `404` for unknown work slug
- `500` safe error on unexpected failures

Standard error shape:

```json
{
  "version": "1.0",
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

Returns:

- `items[]` with:
  - `slug`
  - `title`
  - `summary`
  - `tags[]`
  - `role`
  - `timeline`
  - `coverImageUrl`
  - `publishedAt`
  - `updatedAt`

### `GET /api/mobile/work/[slug]`

Returns:

- `item` with all summary fields, plus:
  - `content.format` = `"markdown"`
  - `content.body` (raw markdown)
  - `sections.context`
  - `sections.constraints`
  - `sections.approach`
  - `sections.outcome`
  - `sections.learnings`
  - `links.liveDemo` (nullable)
  - `links.repository` (nullable)

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
curl -s http://localhost:4321/api/mobile/work/smart-edge-cache-proxy | jq
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
- `content.format` is currently `markdown`.
- Dates are string values (`YYYY-MM-DD`).

Breaking changes should bump API version.
