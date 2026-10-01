---
title: "Hosted Images Gatekeeper: Edge Access Control"
description: "Impact: Reduced image hotlink abuse and bot scraping by enforcing edge-level request policy before image delivery."
date: "2026-03-20T00:00:00.000Z"
tags:
  - Cloudflare Workers
  - Edge Security
featured: false
draft: false
---

## TL;DR
Designed and deployed an edge gatekeeper in front of hosted image delivery to block abusive fetch patterns before they consume bandwidth. The worker enforces strict method rules, referer allow-list checks, bot-style user-agent filtering, and image-intent validation using request headers. Trusted crawler traffic is handled with controlled relaxations, and only valid requests are proxied to the image backend. The result is safer image distribution with lower abuse surface and cleaner CDN utilization.

## Problem
Public image endpoints were exposed to common abuse patterns such as hotlinking, scripted scraping, and non-browser bulk fetches. Unchecked access increased transfer costs, introduced cache pollution risk, and made traffic quality difficult to reason about. A policy layer was needed to stop invalid requests early while preserving legitimate browser and search crawler access.

## Constraints
- Keep image delivery fast and cache-friendly for valid traffic.
- Avoid exposing backend image account details directly to requesters.
- Block high-noise automation patterns without breaking normal browser rendering.
- Preserve crawler compatibility for discoverability use cases.
- Provide operational diagnostics without adding heavy runtime overhead.

## Architecture
The gatekeeper is implemented as a Cloudflare Worker on the image route path.

1. **Request guard stage**
- Allows only safe `GET` and `HEAD` methods.
- Applies strict referer allow-list policy with subdomain controls.
- Rejects known automation-style user agents and malformed access patterns.

2. **Context-aware trust handling**
- Supports trusted crawler treatment through user-agent and network metadata checks.
- Keeps generic deny messaging to reduce information leakage to abusive clients.
- Uses runtime toggles for controlled bypass/debug behavior during operations.

3. **Safe proxy execution**
- Valid requests are proxied to hosted image delivery endpoints.
- Pass-through supports conditional request headers such as `If-None-Match` and range usage.
- Responses are constrained to image content types only.

4. **Observability and lightweight analytics**
- Structured diagnostics can be emitted for deny and error paths.
- Optional D1 upsert tracks image request outcomes for operational visibility.
- Logging modes allow noise control (`none`, `deny`, or `all`) per environment.

## Key Decisions
- **Policy-first edge gatekeeping**
  Access decisions are made before contacting image origin systems.

- **Strict allow-list over permissive matching**
  Explicit domain controls reduce accidental exposure and hotlink drift.

- **Image-intent validation**
  Request header checks reduce non-image automation traffic reaching the backend.

- **Controlled crawler exceptions**
  Search crawler handling is explicit and bounded rather than globally bypassed.

- **Operational toggles with structured diagnostics**
  Security posture can be tuned safely without code redeploys for each adjustment.

## Results
- Reduced abusive image requests reaching backend delivery endpoints.
- Lowered bandwidth waste from unauthorized embedding and scripted fetches.
- Improved confidence in traffic quality through deny-path telemetry.
- Preserved valid browser image delivery and crawler accessibility.
- Established a reusable edge access-control pattern for additional media routes.

## Future Enhancements
- Add per-route rate controls for burst abuse patterns.
- Introduce temporary override controls for incident response workflows.
- Expand anomaly reporting with per-domain deny trend dashboards.
- Add signed URL mode for premium/private media access paths.
