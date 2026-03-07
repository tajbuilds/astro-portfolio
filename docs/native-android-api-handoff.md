# Native Android API Handoff (Astro Portfolio)

This document defines exactly what to add in this repo so a Kotlin native Android app can consume portfolio data reliably.

## Goal

Expose stable JSON endpoints from this Astro project for:

- Home
- Work list
- Work detail
- About
- Contact metadata

The Android app should never parse HTML pages directly.

## Scope (MVP)

Create these endpoints:

- `GET /api/mobile/home`
- `GET /api/mobile/work`
- `GET /api/mobile/work/[slug]`
- `GET /api/mobile/about`
- `GET /api/mobile/contact`

All endpoints return JSON only.

## Non-Goals (for now)

- Authenticated endpoints
- CMS mutation APIs
- Full text search endpoint
- GraphQL
- Complex pagination

## File Plan (Astro)

Add new files:

- `src/pages/api/mobile/home.json.ts`
- `src/pages/api/mobile/work.json.ts`
- `src/pages/api/mobile/work/[slug].json.ts`
- `src/pages/api/mobile/about.json.ts`
- `src/pages/api/mobile/contact.json.ts`
- `src/lib/mobile-api.ts`

Optional types file:

- `src/types/mobile-api.ts`

## Response Rules

Use these rules across all endpoints:

- `Content-Type: application/json; charset=utf-8`
- Include `version: "1.0"` in every response root
- Include `generatedAt` as ISO datetime
- Use UTC timestamps
- Keep field names stable (snake_case or camelCase; pick one and keep consistent)
- Return `404` for unknown work slug
- Return `500` with safe message on unexpected error

Suggested standard error shape:

```json
{
  "version": "1.0",
  "error": {
    "code": "not_found",
    "message": "Work item not found"
  }
}
```

## Data Contract (exact shape)

Use this contract so Android models are predictable.

### `GET /api/mobile/home`

```json
{
  "version": "1.0",
  "generatedAt": "2026-03-07T00:00:00.000Z",
  "profile": {
    "name": "Tajinder Singh",
    "role": "Solutions Architect",
    "tagline": "Architecture-first systems for edge, automation, and data",
    "avatarUrl": "/images/tajinder-singh-portrait.jpg",
    "location": "United Kingdom"
  },
  "featuredWork": [
    {
      "slug": "smart-edge-cache-proxy",
      "title": "Smart Edge Cache Proxy",
      "summary": "Outcome-focused short summary",
      "tags": ["cloudflare", "edge"],
      "coverImageUrl": "/blog-placeholder-1.jpg",
      "publishedAt": "2026-01-01",
      "updatedAt": "2026-02-10"
    }
  ],
  "cta": {
    "primary": { "label": "View Work", "path": "/work" },
    "secondary": { "label": "Contact", "path": "/contact" }
  }
}
```

### `GET /api/mobile/work`

```json
{
  "version": "1.0",
  "generatedAt": "2026-03-07T00:00:00.000Z",
  "items": [
    {
      "slug": "smart-edge-cache-proxy",
      "title": "Smart Edge Cache Proxy",
      "summary": "Outcome-focused short summary",
      "tags": ["cloudflare", "edge"],
      "role": "Solutions Architect",
      "timeline": "2025",
      "coverImageUrl": "/blog-placeholder-1.jpg",
      "publishedAt": "2026-01-01",
      "updatedAt": "2026-02-10"
    }
  ]
}
```

### `GET /api/mobile/work/[slug]`

```json
{
  "version": "1.0",
  "generatedAt": "2026-03-07T00:00:00.000Z",
  "item": {
    "slug": "smart-edge-cache-proxy",
    "title": "Smart Edge Cache Proxy",
    "summary": "Outcome-focused short summary",
    "tags": ["cloudflare", "edge"],
    "role": "Solutions Architect",
    "timeline": "2025",
    "coverImageUrl": "/blog-placeholder-1.jpg",
    "publishedAt": "2026-01-01",
    "updatedAt": "2026-02-10",
    "content": {
      "format": "html",
      "body": "<h2>Context</h2><p>...</p>"
    },
    "sections": {
      "context": "...",
      "constraints": "...",
      "approach": "...",
      "outcome": "...",
      "learnings": "..."
    },
    "links": {
      "liveDemo": null,
      "repository": null
    }
  }
}
```

Notes:

- Prefer `content.format = "html"` for easiest Android rendering (`Compose WebView` or HTML text renderer).
- If you prefer Markdown, return `format = "markdown"` and parse in app.

### `GET /api/mobile/about`

```json
{
  "version": "1.0",
  "generatedAt": "2026-03-07T00:00:00.000Z",
  "about": {
    "name": "Tajinder Singh",
    "headline": "Solutions Architect",
    "bio": "Short professional narrative.",
    "skills": ["Kotlin", "Cloudflare", "TypeScript"],
    "focusAreas": ["Edge systems", "Automation", "Search"],
    "avatarUrl": "/images/tajinder-singh-portrait.jpg",
    "social": [
      { "label": "GitHub", "url": "https://github.com/..." },
      { "label": "LinkedIn", "url": "https://linkedin.com/in/..." }
    ]
  }
}
```

### `GET /api/mobile/contact`

```json
{
  "version": "1.0",
  "generatedAt": "2026-03-07T00:00:00.000Z",
  "contact": {
    "email": "hello@domain.com",
    "formPath": "/api/contact",
    "turnstileRequired": true,
    "links": [
      { "label": "LinkedIn", "url": "https://linkedin.com/in/..." }
    ]
  }
}
```

## Caching Headers

For read-only content endpoints, set:

- `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`

If content updates frequently, reduce values.

## Implementation Checklist

1. Create `src/lib/mobile-api.ts` helper functions:
- map Astro content entries to API DTOs
- normalize optional fields
- generate absolute or root-relative URLs consistently

2. Build endpoint handlers:
- read from `getCollection("work")` or appropriate sources
- sort output (`updatedAt` desc or `publishedAt` desc)
- return stable JSON shape

3. Add 404 behavior in `/work/[slug].json.ts`:
- when slug missing, return `404` with standard error

4. Add cache and content-type headers in each endpoint.

5. Validate payloads manually:

```bash
npm run dev
curl -s http://localhost:4321/api/mobile/home | jq
curl -s http://localhost:4321/api/mobile/work | jq
curl -s http://localhost:4321/api/mobile/work/smart-edge-cache-proxy | jq
curl -s http://localhost:4321/api/mobile/about | jq
curl -s http://localhost:4321/api/mobile/contact | jq
```

6. Document endpoint contract in `README.md` under a new section `Mobile API`.

## Minimal Quality Gates (before Android starts)

- All 5 endpoints respond with HTTP 200 (except missing slug -> 404)
- `version` and `generatedAt` present in all responses
- Work list slugs match route slugs
- No secrets in API payloads
- Payload size reasonable for mobile (prefer under 100KB per detail response)

## Android Consumer Expectations

The Android app will assume:

- endpoint paths stay unchanged
- required fields stay present
- `content.format` remains stable (`html` or `markdown`)
- dates are ISO-like strings

Breaking changes must increment API version.

## Change Policy

- Non-breaking additions: new optional fields only
- Breaking changes: bump `version` to `2.0` and keep `1.0` for transition if possible

## Suggested Next Step After This Repo Change

After these endpoints are live, Android project can be scaffolded with:

- Retrofit interface matching this contract
- Room cache tables for `home`, `work_list`, `work_detail`, `about`
- Compose screens bound to repository/viewmodels

