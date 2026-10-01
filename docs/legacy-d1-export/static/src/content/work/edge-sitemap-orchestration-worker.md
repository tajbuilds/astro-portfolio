---
title: "Edge SEO Control Plane: Sitemap + Deals Resolver"
description: "Impact: Improved crawl reliability and URL consistency using edge sitemap delivery plus deterministic deals URL expansion and canonical control."
date: "2026-03-20T00:00:00.000Z"
tags:
  - Cloudflare Workers
  - SEO Infrastructure
featured: false
draft: false
---

## TL;DR
Designed and deployed an edge SEO control plane composed of two coordinated Cloudflare Workers: one for multi-tenant sitemap delivery and one for dynamic deals URL resolution. The sitemap worker serves crawler-facing index/shard files from edge storage with conditional caching behavior, while the deals resolver expands incomplete query URLs and enforces canonical consistency for rendered pages. Together, they improve crawl reliability, reduce SEO drift from duplicated URL variants, and keep origin systems insulated from high-volume bot access patterns.

## Problem
SEO behavior was fragmented across two high-risk surfaces:
- sitemap freshness and tenant-specific indexing for multiple domains
- dynamic deals URLs where incomplete query strings created duplicate render paths and inconsistent canonical signals

Without a controlled edge layer, crawlers could receive stale or incomplete indexing data, and URL variant sprawl could dilute search relevance. The system needed deterministic handling of both discovery (sitemaps) and URL normalization (deals pages) without relying on fragile frontend workarounds.

## Constraints
- Support multi-domain behavior with shared worker logic and tenant-aware configuration.
- Preserve low-latency crawler access at edge locations.
- Handle common sitemap patterns (`sitemap.xml`, `sitemap_index.xml`, shard files).
- Resolve id-only deals URLs safely into complete forms for consistent page behavior.
- Keep canonical signals stable while avoiding deep application rewrites.
- Minimize operational toil when content or route rules change.

## Architecture
The solution is implemented as two edge services with separate concerns and shared SEO goals.

1. **Sitemap Delivery Worker (discovery plane)**
- Serves tenant-specific sitemap assets from R2 using host-aware key resolution.
- Supports sitemap index and shard patterns with deterministic lookup fallback.
- Returns `ETag` and cache directives to reduce repeated crawler transfer cost.
- Exposes targeted cache purge endpoint for rapid post-publish freshness.

2. **Deals Resolver Worker (URL normalization plane)**
- Intercepts deals routes and checks whether required query parameters are present.
- For incomplete requests, calls expansion API and issues redirect to a complete canonicalized URL shape.
- For complete requests, fetches origin HTML and rewrites canonical tags to a controlled short-form URL strategy.
- Uses per-site KV config to avoid hardcoding route behavior.

3. **Operational control model**
- Runtime toggles and config-driven rules support safe iteration across domains.
- Debug and structured diagnostics improve visibility during rollout and troubleshooting.
- Edge routing isolates SEO-critical logic from CMS/frontend release cycles.

## Key Decisions
- **Split responsibility across two focused workers**
  Discovery and URL normalization are managed independently, reducing coupling and rollout risk.

- **Config-driven expansion and canonical policy**
  Deals resolver behavior is controlled via KV and API contracts rather than theme-level patches.

- **Edge-first sitemap serving**
  Crawler-heavy sitemap traffic is handled from R2 + edge cache, not application origin.

- **Deterministic URL completion flow**
  Incomplete requests are redirected to complete forms to prevent duplicate render states.

- **Canonical rewrite enforcement**
  Canonical output is normalized at the edge to reduce SEO signal fragmentation.

## Results
- Improved crawler-facing stability for both sitemap discovery and deals URL indexing paths.
- Reduced duplicate URL behavior by redirecting incomplete parameter requests to normalized forms.
- Strengthened canonical consistency on rendered deals pages through controlled edge rewrites.
- Reduced operational dependency on frontend/CMS releases for SEO-critical behavior changes.
- Established a reusable multi-tenant SEO platform pattern for additional domains.

## Future Enhancements
- Add signed publish webhooks to trigger automated sitemap cache purge and health checks.
- Expand per-route SEO telemetry (redirect rate, canonical rewrite rate, sitemap 304 ratio).
- Add config validation gates for route expansion and required parameter rules.
- Introduce tenant-level dashboarding for freshness lag and normalization anomalies.
